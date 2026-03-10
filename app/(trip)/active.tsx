import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Modal } from '@/src/components/ui/Modal';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { AlertConfirmation } from '@/src/components/alert/AlertConfirmation';
import { AnomalyDialog } from '@/src/components/trip/AnomalyDialog';
import { NoResponseDialog } from '@/src/components/trip/NoResponseDialog';
import { TopStatusCard } from '@/src/components/trip/TopStatusCard';
import { ExtendModal } from '@/src/components/trip/ExtendModal';
import { CancelTripDialog } from '@/src/components/trip/CancelTripDialog';
import { EditTripSheet } from '@/src/components/trip/EditTripSheet';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { usePanicAlert } from '@/src/hooks/usePanicAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { useAnomalyDetection } from '@/src/hooks/useAnomalyDetection';
import { useArrivalDetection } from '@/src/hooks/useArrivalDetection';
import { useTripNotifications } from '@/src/hooks/useTripNotifications';
import { fetchDirections } from '@/src/services/directionsService';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';
import type { EditTripInput } from '@/src/services/tripService';

export default function ActiveTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lastKnownLat, lastKnownLng, batteryLevel, reset: resetTripStore } = useTripStore();
  const { trip, isOvertime } = useActiveTrip();
  const { cancelTrip, isCancelling, extendTrip, isExtending, editTrip, isEditing } = useTrip();
  const { triggerAlert, isTriggering } = useAlert();
  const { triggerPanic, isTriggering: isPanicTriggering } = usePanicAlert();
  const { startTracking, stopTracking, isTracking } = useLocation({
    tripStatus: trip?.status ?? null,
    remainingMinutes: trip?.estimated_arrival_at
      ? Math.max(0, Math.round((new Date(trip.estimated_arrival_at).getTime() - Date.now()) / 60_000))
      : null,
    tripStartedAt: trip?.started_at ?? null,
  });
  const { contacts } = useContacts();
  useTripNotifications(trip);
  const [route, setRoute] = useState<DecodedRoute | null>(null);

  const {
    showAnomalyDialog,
    showNoResponseDialog,
    detectedAnomalyType,
    dismissAnomalyDialog,
    handleAnomalySelect,
    handleAllGood,
    handleTriggerAlert: onNoResponseTriggerAlert,
    handleAutoAlert: onNoResponseAutoAlert,
  } = useAnomalyDetection({
    routePolyline: route?.polyline,
    estimatedArrivalAt: trip?.estimated_arrival_at,
    tripStatus: trip?.status,
  });

  const handleArrivalDetected = useCallback(() => {
    router.replace('/(trip)/complete');
  }, [router]);

  useArrivalDetection({
    trip,
    onArrivalDetected: handleArrivalDetected,
  });

  const [showLaunchToast, setShowLaunchToast] = useState(true);
  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLaunchToast(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const departure = trip?.departure_lat != null && trip?.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const arrival = trip?.arrival_lat != null && trip?.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  useEffect(() => {
    if (!departure || !arrival || route) return;

    let cancelled = false;
    fetchDirections(departure, arrival)
      .then((r) => {
        if (r && !cancelled) setRoute(r);
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, [departure?.lat, departure?.lng, arrival?.lat, arrival?.lng, route]);

  useEffect(() => {
    if (!isTracking) {
      startTracking().catch(() => undefined);
    }
  }, [isTracking, startTracking]);

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
    } catch (err) {
      if (__DEV__) console.warn('Alert trigger failed:', err);
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

  const handleAlert = useCallback(async () => {
    try {
      await triggerPanic(true);
    } catch {
      setShowAlertConfirmation(true);
    }
  }, [triggerPanic]);

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

  const handleCancelTrip = () => {
    setShowCancelDialog(true);
  };

  const handleQuickCancel = async () => {
    if (!trip) return;
    try {
      await stopTracking();
    } catch {
      // tracking cleanup is best-effort
    }
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      router.replace('/(tabs)');
    } catch (err) {
      if (__DEV__) console.warn('Quick cancel failed:', err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!trip) return;
    try {
      await stopTracking();
    } catch {
      // tracking cleanup is best-effort
    }
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      setShowCancelDialog(false);
      router.replace('/(tabs)');
    } catch (err) {
      if (__DEV__) console.warn('Trip cancel failed:', err);
    }
  };

  const handleEditTrip = async (input: EditTripInput) => {
    if (!trip) return;
    try {
      await editTrip({ id: trip.id, input });
      setShowEditSheet(false);
      if (input.arrivalLat != null && input.arrivalLng != null && departure) {
        const newArrival = { lat: input.arrivalLat, lng: input.arrivalLng };
        const newRoute = await fetchDirections(departure, newArrival);
        if (newRoute) setRoute(newRoute);
      }
    } catch (err) {
      if (__DEV__) console.warn('Trip edit failed:', err);
    }
  };

  const handleExtend = async (minutes: number) => {
    if (!trip) return;
    try {
      await extendTrip({ id: trip.id, minutes });
      setShowExtendModal(false);
    } catch (err) {
      if (__DEV__) console.warn('Trip extend failed:', err);
    }
  };

  const footerBottom = insets.bottom + spacing[3];

  return (
    <View style={styles.container}>
      {/* Alert button — top center */}
      <View style={[styles.alertContainer, { top: insets.top + spacing[2] }]}>
        <AlertButton
          onTrigger={handleAlert}
          disabled={isPanicTriggering || isTriggering}
          size={ms(56, 0.4)}
        />
      </View>

      {/* Launch toast or TopStatusCard with dropdown */}
      {showLaunchToast ? (
        <View style={[styles.launchToast, { top: insets.top + ms(56, 0.4) + spacing[2] + spacing[4] }]}>
          <View style={styles.launchToastContent}>
            <Ionicons name="walk" size={ms(24)} color={colors.white} />
            <View style={styles.launchToastText}>
              <Text style={styles.launchToastTitle}>Trajet lancé</Text>
              <Text style={styles.launchToastSubtitle}>Ton trajet va démarrer</Text>
            </View>
            <TouchableOpacity onPress={handleQuickCancel} hitSlop={8}>
              <Text style={styles.launchToastCancel}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.statusCardContainer, { top: insets.top + ms(56, 0.4) + spacing[2] + spacing[4] }]}>
          <TopStatusCard
            isExpanded={isInfoExpanded}
            onToggleExpand={() => setIsInfoExpanded((v) => !v)}
            isOvertime={isOvertime}
            trip={trip}
            contactCount={contacts.length}
            onEndTrip={handleEndTrip}
            onPauseTrip={handlePause}
            onExtendTrip={() => setShowExtendModal(true)}
            onEditTrip={() => setShowEditSheet(true)}
            onCancelTrip={handleCancelTrip}
            isCancelling={isCancelling}
          />
        </View>
      )}

      {/* Navigation footer */}
      <View style={[styles.navFooter, { bottom: footerBottom }]}>
        <Pressable
          style={[styles.navItemInactive, styles.navItemLeft]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
        <Pressable style={styles.navItemActive}>
          <View style={styles.navDot} />
        </Pressable>
        <Pressable
          style={[styles.navItemInactive, styles.navItemRight]}
          onPress={() => Alert.alert('Abonnement', 'Bientôt disponible')}
        >
          <Ionicons name="star" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
      </View>

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
        anomalyType={detectedAnomalyType ?? 'generic'}
      />

      <NoResponseDialog
        visible={showNoResponseDialog}
        onAllGood={handleAllGood}
        onTriggerAlert={handleNoResponseTriggerAlert}
        onAutoAlert={handleNoResponseAutoAlert}
      />

      <CancelTripDialog
        visible={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        isCancelling={isCancelling}
        hasContact={!!trip?.trusted_contact_id}
      />

      <EditTripSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSave={handleEditTrip}
        isSaving={isEditing}
        trip={trip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[900],
  },
  alertContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
  },
  statusCardContainer: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 5,
  },
  launchToast: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    backgroundColor: colors.secondary[700],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    zIndex: 5,
  },
  launchToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  launchToastText: {
    flex: 1,
  },
  launchToastTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  launchToastSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  launchToastCancel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  navFooter: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(10, 10, 20, 0.9)',
    borderRadius: scaledRadius(28),
    overflow: 'hidden',
    zIndex: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItemLeft: {
    borderRightWidth: 1,
  },
  navItemRight: {
    borderLeftWidth: 1,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
  },
  navDot: {
    width: ms(12, 0.4),
    height: ms(12, 0.4),
    borderRadius: ms(6, 0.4),
    backgroundColor: colors.brandPosition[50],
    borderWidth: 2,
    borderColor: 'rgba(204, 99, 249, 0.4)',
  },
});
