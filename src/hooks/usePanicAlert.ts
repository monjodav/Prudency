import { useCallback, useRef, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlert } from './useAlert';
import { useActiveTrip } from './useActiveTrip';
import { useLocation } from './useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { getBatteryLevel } from '@/src/utils/battery';
import * as locationSharingService from '@/src/services/locationSharingService';

const AUTO_ESCALATION_DELAY_MS = 120_000; // 2 minutes before auto-sending data

type PanicPhase =
  | 'idle'
  | 'triggering'
  | 'sent_contact_only'
  | 'sent_with_data'
  | 'error';

interface PanicState {
  phase: PanicPhase;
  alertId: string | null;
  escalationSecondsLeft: number;
  error: string | null;
}

const INITIAL_STATE: PanicState = {
  phase: 'idle',
  alertId: null,
  escalationSecondsLeft: AUTO_ESCALATION_DELAY_MS / 1000,
  error: null,
};

export function usePanicAlert() {
  const router = useRouter();
  const { triggerAlert, isTriggering } = useAlert();
  const { trip } = useActiveTrip();
  const { getCurrentLocation } = useLocation();
  const { lastKnownLat, lastKnownLng, batteryLevel } = useTripStore();

  const [state, setState] = useState<PanicState>(INITIAL_STATE);
  const escalationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const escalationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEscalationTimers = useCallback(() => {
    if (escalationTimerRef.current) {
      clearInterval(escalationTimerRef.current);
      escalationTimerRef.current = null;
    }
    if (escalationTimeoutRef.current) {
      clearTimeout(escalationTimeoutRef.current);
      escalationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearEscalationTimers;
  }, [clearEscalationTimers]);

  const fetchFreshLocation = useCallback(async (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    try {
      const loc = await getCurrentLocation();
      return { lat: loc.lat, lng: loc.lng };
    } catch {
      if (lastKnownLat != null && lastKnownLng != null) {
        return { lat: lastKnownLat, lng: lastKnownLng };
      }
      return null;
    }
  }, [getCurrentLocation, lastKnownLat, lastKnownLng]);

  const sendAlertWithData = useCallback(
    async (reason?: string) => {
      if (!trip) return;

      const location = await fetchFreshLocation();
      const battery = await getBatteryLevel().catch(() => batteryLevel);

      await triggerAlert({
        tripId: trip.id,
        type: 'manual',
        reason: reason ?? 'Alerte manuelle (urgence)',
        lat: location?.lat,
        lng: location?.lng,
        batteryLevel: battery ?? undefined,
      });
    },
    [trip, fetchFreshLocation, batteryLevel, triggerAlert],
  );

  const startEscalationCountdown = useCallback(() => {
    clearEscalationTimers();

    let secondsLeft = AUTO_ESCALATION_DELAY_MS / 1000;
    setState((prev) => ({ ...prev, escalationSecondsLeft: secondsLeft }));

    escalationTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setState((prev) => ({
        ...prev,
        escalationSecondsLeft: Math.max(0, secondsLeft),
      }));
    }, 1000);

    escalationTimeoutRef.current = setTimeout(async () => {
      clearEscalationTimers();
      try {
        await sendAlertWithData('Escalade automatique — aucune action utilisatrice');
        setState((prev) => ({
          ...prev,
          phase: 'sent_with_data',
          escalationSecondsLeft: 0,
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Vibration.vibrate([0, 500, 200, 500]);
      } catch {
        // Auto-escalation failed silently — alert was already sent without data
      }
    }, AUTO_ESCALATION_DELAY_MS);
  }, [clearEscalationTimers, sendAlertWithData]);

  const triggerPanic = useCallback(
    async (includeData: boolean) => {
      if (!trip) return;

      setState((prev) => ({ ...prev, phase: 'triggering', error: null }));

      // Immediate haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Vibration.vibrate([0, 300, 100, 300]);

      try {
        // Boost GPS tracking frequency for realtime location sharing
        locationSharingService.startAlertTracking(trip.id).catch(() => undefined);

        if (includeData) {
          await sendAlertWithData('Alerte manuelle (urgence)');
          setState((prev) => ({
            ...prev,
            phase: 'sent_with_data',
            escalationSecondsLeft: 0,
          }));
          clearEscalationTimers();
        } else {
          // Send contact-only alert (no location/battery data)
          await triggerAlert({
            tripId: trip.id,
            type: 'manual',
            reason: 'Alerte manuelle (urgence) — prise de contact',
          });
          setState((prev) => ({ ...prev, phase: 'sent_contact_only' }));
          startEscalationCountdown();
        }

        router.replace('/(trip)/alert-active');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Echec de l'envoi de l'alerte";
        setState((prev) => ({ ...prev, phase: 'error', error: message }));
      }
    },
    [
      trip,
      sendAlertWithData,
      triggerAlert,
      clearEscalationTimers,
      startEscalationCountdown,
      router,
    ],
  );

  const sendDataNow = useCallback(async () => {
    if (state.phase !== 'sent_contact_only') return;

    clearEscalationTimers();

    try {
      await sendAlertWithData('Envoi des donnees manuellement apres alerte');
      setState((prev) => ({
        ...prev,
        phase: 'sent_with_data',
        escalationSecondsLeft: 0,
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Keep current state — user can retry
    }
  }, [state.phase, clearEscalationTimers, sendAlertWithData]);

  const cancelEscalation = useCallback(() => {
    clearEscalationTimers();
    setState((prev) => ({ ...prev, escalationSecondsLeft: 0 }));
  }, [clearEscalationTimers]);

  const reset = useCallback(() => {
    clearEscalationTimers();
    locationSharingService.stopAlertTracking().catch(() => undefined);
    setState(INITIAL_STATE);
  }, [clearEscalationTimers]);

  return {
    phase: state.phase,
    alertId: state.alertId,
    escalationSecondsLeft: state.escalationSecondsLeft,
    error: state.error,
    isTriggering,
    triggerPanic,
    sendDataNow,
    cancelEscalation,
    reset,
  };
}
