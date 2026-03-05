import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { Modal } from '@/src/components/ui/Modal';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { AlertConfirmation } from '@/src/components/alert/AlertConfirmation';
import { AnomalyDialog } from '@/src/components/trip/AnomalyDialog';
import { NoResponseDialog } from '@/src/components/trip/NoResponseDialog';
import { TopStatusCard } from '@/src/components/trip/TopStatusCard';
import { BottomInfoPanel } from '@/src/components/trip/BottomInfoPanel';
import { ExtendModal } from '@/src/components/trip/ExtendModal';
import { CancelTripDialog } from '@/src/components/trip/CancelTripDialog';
import { EditTripSheet } from '@/src/components/trip/EditTripSheet';
import { TripMap } from '@/src/components/map/TripMap';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { usePanicAlert } from '@/src/hooks/usePanicAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { useAnomalyDetection } from '@/src/hooks/useAnomalyDetection';
import { useArrivalDetection } from '@/src/hooks/useArrivalDetection';
import { fetchDirections } from '@/src/services/directionsService';
import { ms } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';
import type { EditTripInput } from '@/src/services/tripService';

export default function ActiveTripScreen() {
  const router = useRouter();
  const { lastKnownLat, lastKnownLng, batteryLevel, reset: resetTripStore } = useTripStore();
  const { trip, isOvertime } = useActiveTrip();
  const { cancelTrip, isCancelling, extendTrip, isExtending, editTrip, isEditing } = useTrip();
  const { triggerAlert, isTriggering } = useAlert();
  const { triggerPanic, isTriggering: isPanicTriggering } = usePanicAlert();
  const { startTracking, stopTracking, isTracking, trackingMode } = useLocation({
    tripStatus: trip?.status ?? null,
    remainingMinutes: trip?.estimated_arrival_at
      ? Math.max(0, Math.round((new Date(trip.estimated_arrival_at).getTime() - Date.now()) / 60_000))
      : null,
    tripStartedAt: trip?.started_at ?? null,
  });
  const { contacts } = useContacts();
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

  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

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
        <AlertButton onTrigger={handleAlert} disabled={isPanicTriggering || isTriggering} />
      </View>

      <BottomInfoPanel
        trip={trip}
        contactCount={contacts.length}
        isOvertime={isOvertime}
        onEndTrip={handleEndTrip}
        onPauseTrip={handlePause}
        onExtendTrip={() => setShowExtendModal(true)}
        onEditTrip={() => setShowEditSheet(true)}
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
    backgroundColor: colors.black,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },
  alertButtonContainer: {
    position: 'absolute',
    right: spacing[4],
    bottom: ms(420, 0.5),
    alignItems: 'center',
  },
});
