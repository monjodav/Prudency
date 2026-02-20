import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { AlertConfirmation } from '@/src/components/alert/AlertConfirmation';
import { AnomalyDialog } from '@/src/components/trip/AnomalyDialog';
import { NoResponseDialog } from '@/src/components/trip/NoResponseDialog';
import { TripMap } from '@/src/components/map/TripMap';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { useAnomalyDetection } from '@/src/hooks/useAnomalyDetection';
import { fetchDirections } from '@/src/services/directionsService';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';

const EXTEND_OPTIONS = [15, 30, 45, 60] as const;

export default function ActiveTripScreen() {
  const router = useRouter();
  const { lastKnownLat, lastKnownLng, batteryLevel } = useTripStore();
  const { trip, isOvertime } = useActiveTrip();
  const { cancelTrip, isCancelling, extendTrip, isExtending } = useTrip();
  const { triggerAlert, isTriggering } = useAlert();
  const { startTracking, stopTracking, isTracking } = useLocation();
  const { contacts } = useContacts();
  const {
    showAnomalyDialog,
    showNoResponseDialog,
    presentAnomalyDialog,
    dismissAnomalyDialog,
    handleAnomalySelect,
    handleAllGood,
    handleTriggerAlert: onNoResponseTriggerAlert,
    handleAutoAlert: onNoResponseAutoAlert,
  } = useAnomalyDetection();

  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [route, setRoute] = useState<DecodedRoute | null>(null);

  const departure = trip?.departure_lat != null && trip?.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const arrival = trip?.arrival_lat != null && trip?.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  useEffect(() => {
    if (departure && arrival && !route) {
      fetchDirections(departure, arrival).then((r) => {
        if (r) setRoute(r);
      });
    }
  }, [departure?.lat, departure?.lng, arrival?.lat, arrival?.lng]);

  useEffect(() => {
    if (!isTracking) {
      startTracking().catch(() => undefined);
    }
  }, [isTracking, startTracking]);

  useEffect(() => {
    if (isOvertime && trip) {
      presentAnomalyDialog();
    }
  }, [isOvertime, trip, presentAnomalyDialog]);

  const fireAlert = useCallback(async (type: 'manual' | 'automatic') => {
    if (!trip) return;
    try {
      await triggerAlert({
        tripId: trip.id,
        type,
        lat: lastKnownLat ?? undefined,
        lng: lastKnownLng ?? undefined,
        batteryLevel: batteryLevel ?? undefined,
      });
      router.replace('/(trip)/alert-active');
    } catch {
      // Alert failed silently
    }
  }, [trip, triggerAlert, lastKnownLat, lastKnownLng, batteryLevel, router]);

  const handleNoResponseTriggerAlert = useCallback(() => {
    onNoResponseTriggerAlert();
    fireAlert('manual');
  }, [onNoResponseTriggerAlert, fireAlert]);

  const handleNoResponseAutoAlert = useCallback(() => {
    onNoResponseAutoAlert();
    fireAlert('automatic');
  }, [onNoResponseAutoAlert, fireAlert]);

  const handleAlert = async () => {
    if (!trip) return;
    try {
      await triggerAlert({
        tripId: trip.id,
        type: 'manual',
        lat: lastKnownLat ?? undefined,
        lng: lastKnownLng ?? undefined,
        batteryLevel: batteryLevel ?? undefined,
      });
      router.replace('/(trip)/alert-active');
    } catch {
      setShowAlertConfirmation(true);
    }
  };

  const handlePause = async () => {
    try {
      await stopTracking();
    } finally {
      router.replace('/(trip)/paused');
    }
  };

  const handleEndTrip = () => {
    router.replace('/(trip)/complete');
  };

  const handleCancelTrip = async () => {
    if (!trip) return;
    try {
      await cancelTrip(trip.id);
      router.replace('/(tabs)');
    } catch {
      // Cancel failed silently
    }
  };

  const handleExtend = async (minutes: number) => {
    if (!trip) return;
    try {
      await extendTrip({ id: trip.id, minutes });
      setShowExtendModal(false);
    } catch {
      // Extend failed silently
    }
  };

  return (
    <View style={styles.container}>
      <TripMap
        departure={departure}
        arrival={arrival}
        routeCoordinates={route?.polyline}
        showUserLocation
        userLocation={lastKnownLat != null && lastKnownLng != null
          ? { lat: lastKnownLat, lng: lastKnownLng }
          : undefined}
        style={styles.fullScreenMap}
      />

      <TopStatusCard isOvertime={isOvertime} />

      <View style={styles.alertButtonContainer}>
        <AlertButton onTrigger={handleAlert} disabled={isTriggering} />
      </View>

      <BottomInfoPanel
        trip={trip}
        contactCount={contacts.length}
        isOvertime={isOvertime}
        onEndTrip={handleEndTrip}
        onPauseTrip={handlePause}
        onExtendTrip={() => setShowExtendModal(true)}
        onCancelTrip={handleCancelTrip}
        isCancelling={isCancelling}
      />

      <Modal
        visible={showAlertConfirmation}
        onClose={() => setShowAlertConfirmation(false)}
      >
        <AlertConfirmation
          contactCount={contacts.length}
          onDismiss={() => setShowAlertConfirmation(false)}
          onCancel={() => setShowAlertConfirmation(false)}
        />
      </Modal>

      <ExtendModal
        visible={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onExtend={handleExtend}
        isExtending={isExtending}
      />

      <AnomalyDialog
        visible={showAnomalyDialog}
        onClose={dismissAnomalyDialog}
        onSelect={handleAnomalySelect}
        anomalyType={isOvertime ? 'overtime' : 'generic'}
      />

      <NoResponseDialog
        visible={showNoResponseDialog}
        onAllGood={handleAllGood}
        onTriggerAlert={handleNoResponseTriggerAlert}
        onAutoAlert={handleNoResponseAutoAlert}
      />
    </View>
  );
}

function TopStatusCard({ isOvertime }: { isOvertime: boolean }) {
  return (
    <View style={styles.topCard}>
      <View style={styles.topCardContent}>
        <Ionicons
          name={isOvertime ? 'warning' : 'navigate-circle'}
          size={scaledIcon(24)}
          color={isOvertime ? colors.warning[400] : colors.success[400]}
        />
        <View style={styles.topCardText}>
          <Text style={styles.topCardTitle}>
            {isOvertime ? 'Temps depasse' : 'Trajet en cours'}
          </Text>
          <Text style={styles.topCardSubtitle}>
            {isOvertime
              ? 'Tu as depasse ton heure d\'arrivee'
              : 'Ton trajet a demarre'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BottomInfoPanel({
  trip,
  contactCount,
  isOvertime,
  onEndTrip,
  onPauseTrip,
  onExtendTrip,
  onCancelTrip,
  isCancelling,
}: {
  trip: ReturnType<typeof useActiveTrip>['trip'];
  contactCount: number;
  isOvertime: boolean;
  onEndTrip: () => void;
  onPauseTrip: () => void;
  onExtendTrip: () => void;
  onCancelTrip: () => void;
  isCancelling: boolean;
}) {
  const { elapsed, remaining, progress } = useTripTiming(trip);

  return (
    <View style={styles.bottomPanel}>
      <View style={styles.bottomHandle} />

      <View style={styles.infoSection}>
        <InfoRow
          icon="location"
          label="Destination"
          value={trip?.arrival_address ?? 'Non definie'}
        />
        <InfoRow
          icon="people"
          label="Contacts"
          value={`${contactCount}`}
        />
      </View>

      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <View style={styles.timerItem}>
            <Text style={styles.timerLabel}>Temps ecoule</Text>
            <Text style={styles.timerValue}>{elapsed}</Text>
          </View>
          <View style={styles.timerItem}>
            <Text style={[styles.timerLabel, styles.timerLabelRight]}>Temps restant</Text>
            <Text style={[
              styles.timerValue,
              styles.timerValueRight,
              isOvertime && styles.timerValueOvertime,
            ]}>
              {remaining}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: isOvertime
                  ? colors.error[500]
                  : colors.primary[500],
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Button
          title="Terminer le trajet"
          onPress={onEndTrip}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle" size={scaledIcon(20)} color={colors.white} />}
        />
        <Button
          title="Mettre en pause le trajet"
          variant="outline"
          onPress={onPauseTrip}
          fullWidth
          size="md"
          icon={<Ionicons name="pause-circle-outline" size={scaledIcon(20)} color={colors.primary[50]} />}
        />
        <Button
          title="Prolonger le trajet"
          variant="outline"
          onPress={onExtendTrip}
          fullWidth
          size="md"
          icon={<Ionicons name="time-outline" size={scaledIcon(20)} color={colors.primary[50]} />}
        />
        <Pressable
          style={styles.cancelLink}
          onPress={onCancelTrip}
          disabled={isCancelling}
        >
          <Text style={styles.cancelLinkText}>
            {isCancelling ? 'Annulation...' : 'Annuler le trajet'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={scaledIcon(18)} color={colors.gray[400]} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function useTripTiming(trip: ReturnType<typeof useActiveTrip>['trip']) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!trip?.started_at) {
      return { elapsed: '00:00', remaining: '00:00', progress: 0 };
    }

    const startMs = new Date(trip.started_at).getTime();
    const arrivalMs = trip.estimated_arrival_at
      ? new Date(trip.estimated_arrival_at).getTime()
      : startMs + 30 * 60 * 1000;

    const elapsedMs = Math.max(0, now - startMs);
    const totalMs = arrivalMs - startMs;
    const remainingMs = arrivalMs - now;

    const formatDuration = (ms: number): string => {
      const absSec = Math.abs(Math.floor(ms / 1000));
      const m = Math.floor(absSec / 60);
      const s = absSec % 60;
      const prefix = ms < 0 ? '+' : '';
      return `${prefix}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progress = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;

    return {
      elapsed: formatDuration(elapsedMs),
      remaining: formatDuration(remainingMs),
      progress,
    };
  }, [trip?.started_at, trip?.estimated_arrival_at, now]);
}

function ExtendModal({
  visible,
  onClose,
  onExtend,
  isExtending,
}: {
  visible: boolean;
  onClose: () => void;
  onExtend: (minutes: number) => void;
  isExtending: boolean;
}) {
  const [selected, setSelected] = useState<number>(15);

  return (
    <Modal visible={visible} onClose={onClose} title="Prolonger mon trajet">
      <Text style={styles.extendSubtitle}>
        De combien de temps souhaites-tu prolonger ton trajet ?
      </Text>

      <View style={styles.extendOptions}>
        {EXTEND_OPTIONS.map((minutes) => (
          <Pressable
            key={minutes}
            style={[
              styles.extendOption,
              selected === minutes && styles.extendOptionSelected,
            ]}
            onPress={() => setSelected(minutes)}
          >
            <Text style={[
              styles.extendOptionText,
              selected === minutes && styles.extendOptionTextSelected,
            ]}>
              {minutes} min
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.extendActions}>
        <Button
          title="Annuler"
          variant="outline"
          onPress={onClose}
          style={styles.extendButton}
        />
        <Button
          title="Prolonger"
          onPress={() => onExtend(selected)}
          loading={isExtending}
          style={styles.extendButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },

  // Top status card
  topCard: {
    position: 'absolute',
    top: ms(60, 0.5),
    left: spacing[4],
    right: spacing[4],
    backgroundColor: 'rgba(4, 9, 36, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  topCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  topCardText: {
    flex: 1,
  },
  topCardTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  topCardSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },

  // Alert button
  alertButtonContainer: {
    position: 'absolute',
    right: spacing[4],
    bottom: ms(420, 0.5),
    alignItems: 'center',
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(4, 9, 36, 0.95)',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
  bottomHandle: {
    width: ms(40, 0.5),
    height: ms(4, 0.5),
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[600],
    alignSelf: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },

  // Info section
  infoSection: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoLabel: {
    ...typography.caption,
    color: colors.gray[400],
  },
  infoValue: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.white,
    flex: 1,
    textAlign: 'right',
  },

  // Timer section
  timerSection: {
    marginBottom: spacing[6],
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  timerItem: {
    flex: 1,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[1],
  },
  timerLabelRight: {
    textAlign: 'right',
  },
  timerValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  timerValueRight: {
    textAlign: 'right',
  },
  timerValueOvertime: {
    color: colors.error[400],
  },
  progressBarBackground: {
    width: '100%',
    height: ms(6, 0.5),
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing[2],
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },

  // Actions section
  actionsSection: {
    gap: spacing[3],
    alignItems: 'center',
  },
  cancelLink: {
    paddingVertical: spacing[2],
    marginTop: spacing[1],
  },
  cancelLinkText: {
    ...typography.bodySmall,
    color: colors.error[400],
    fontWeight: '500',
  },

  // Extend modal
  extendSubtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[6],
  },
  extendOptions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  extendOption: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  extendOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  extendOptionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.gray[600],
  },
  extendOptionTextSelected: {
    color: colors.primary[600],
  },
  extendActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  extendButton: {
    flex: 1,
  },
});
