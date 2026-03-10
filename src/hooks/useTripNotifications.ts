import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Battery from 'expo-battery';
import { useNetworkStatus } from './useNetworkStatus';
import type { TripRow } from '@/src/types/trip';

const APPROACHING_ARRIVAL_MINUTES = 10;
const CHECK_IN_INTERVAL_MINUTES = 30;
const LONG_TRIP_THRESHOLD_MINUTES = 60;
const BATTERY_LOW_THRESHOLD = 0.15;

interface ScheduledIds {
  approaching: string | null;
  overtime: string | null;
  checkIns: string[];
  batteryCheck: { remove(): void } | null;
}

async function cancelAllScheduled(ids: ScheduledIds): Promise<void> {
  const toCancel: string[] = [];
  if (ids.approaching) toCancel.push(ids.approaching);
  if (ids.overtime) toCancel.push(ids.overtime);
  toCancel.push(...ids.checkIns);

  await Promise.all(
    toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );

  if (ids.batteryCheck) {
    ids.batteryCheck.remove();
  }
}

export function useTripNotifications(trip: TripRow | null) {
  const { isOnline } = useNetworkStatus();
  const scheduledRef = useRef<ScheduledIds>({
    approaching: null,
    overtime: null,
    checkIns: [],
    batteryCheck: null,
  });
  const batteryAlertSentRef = useRef(false);
  const tripStartedNotifiedRef = useRef<string | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!trip || !['active', 'alerted'].includes(trip.status ?? '')) {
      // Trip ended — cancel everything
      cancelAllScheduled(scheduledRef.current);
      scheduledRef.current = {
        approaching: null,
        overtime: null,
        checkIns: [],
        batteryCheck: null,
      };
      batteryAlertSentRef.current = false;
      return;
    }

    const schedule = async () => {
      // Cancel previous schedule before re-scheduling
      await cancelAllScheduled(scheduledRef.current);
      const ids: ScheduledIds = {
        approaching: null,
        overtime: null,
        checkIns: [],
        batteryCheck: null,
      };

      // Trip started notification — only once per trip
      if (tripStartedNotifiedRef.current !== trip.id) {
        tripStartedNotifiedRef.current = trip.id;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Trajet en cours',
            body: trip.arrival_address
              ? `Ton trajet vers ${trip.arrival_address} a démarré.`
              : 'Ton trajet a démarré. Reste en sécurité.',
            data: { type: 'trip_started', tripId: trip.id },
            sound: 'default',
          },
          trigger: null,
        });
      }

      if (trip.estimated_arrival_at) {
        const arrivalTime = new Date(trip.estimated_arrival_at).getTime();
        const now = Date.now();

        // Approaching arrival (10 min before)
        const approachingTime = arrivalTime - APPROACHING_ARRIVAL_MINUTES * 60_000;
        if (approachingTime > now) {
          ids.approaching = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Bientôt arrivé(e)',
              body: `Tu devrais arriver dans ${APPROACHING_ARRIVAL_MINUTES} minutes. Pense à confirmer ton arrivée.`,
              data: { type: 'approaching_arrival', tripId: trip.id },
              sound: 'default',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(approachingTime) },
          });
        }

        // Overtime (at estimated arrival)
        if (arrivalTime > now) {
          ids.overtime = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Temps dépassé',
              body: "Tu n'as pas encore confirmé(e) ton arrivée. Tes contacts seront prévenu(e)s bientôt.",
              data: { type: 'overtime', tripId: trip.id },
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(arrivalTime) },
          });
        }

        // Check-in reminders for long trips (>60min)
        const durationMinutes = trip.estimated_duration_minutes ?? 0;
        if (durationMinutes >= LONG_TRIP_THRESHOLD_MINUTES) {
          let nextCheckIn = now + CHECK_IN_INTERVAL_MINUTES * 60_000;
          while (nextCheckIn < arrivalTime - APPROACHING_ARRIVAL_MINUTES * 60_000) {
            const checkInId = await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Tout va bien ?',
                body: 'Confirme que tout se passe bien pendant ton trajet.',
                data: { type: 'check_in_reminder', tripId: trip.id },
                sound: 'default',
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(nextCheckIn) },
            });
            ids.checkIns.push(checkInId);
            nextCheckIn += CHECK_IN_INTERVAL_MINUTES * 60_000;
          }
        }
      }

      // Battery monitoring
      ids.batteryCheck = Battery.addBatteryLevelListener(({ batteryLevel }) => {
        if (batteryAlertSentRef.current) return;
        if (batteryLevel <= BATTERY_LOW_THRESHOLD && batteryLevel > 0) {
          batteryAlertSentRef.current = true;
          void Notifications.scheduleNotificationAsync({
            content: {
              title: 'Batterie faible',
              body: `Batterie à ${Math.round(batteryLevel * 100)}%. Pense à brancher ton téléphone pour maintenir le suivi.`,
              data: { type: 'battery_low', tripId: trip.id },
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          }).catch(() => undefined);
        }
      });

      scheduledRef.current = ids;
    };

    schedule();

    return () => {
      cancelAllScheduled(scheduledRef.current);
      scheduledRef.current = {
        approaching: null,
        overtime: null,
        checkIns: [],
        batteryCheck: null,
      };
    };
  }, [trip?.id, trip?.status, trip?.estimated_arrival_at]);

  // Connection lost/restored notifications
  useEffect(() => {
    if (!trip || !['active', 'alerted'].includes(trip.status ?? '')) return;

    if (!isOnline && !wasOfflineRef.current) {
      wasOfflineRef.current = true;
      void Notifications.scheduleNotificationAsync({
        content: {
          title: 'Connexion perdue',
          body: 'Le suivi GPS continue en local. Tes contacts ne recevront pas de mise à jour en temps réel.',
          data: { type: 'connection_status', tripId: trip.id },
          sound: 'default',
        },
        trigger: null,
      }).catch(() => undefined);
    } else if (isOnline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      void Notifications.scheduleNotificationAsync({
        content: {
          title: 'Connexion restaurée',
          body: 'Le suivi en temps réel est de nouveau actif.',
          data: { type: 'connection_status', tripId: trip.id },
          sound: 'default',
        },
        trigger: null,
      }).catch(() => undefined);
    }
  }, [isOnline, trip?.id, trip?.status]);
}
