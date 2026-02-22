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
import { TripMap } from '@/src/components/map/TripMap';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { useAnomalyDetection } from '@/src/hooks/useAnomalyDetection';
import { fetchDirections } from '@/src/services/directionsService';
import { ms } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';

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
    } catch (err) {
      if (__DEV__) console.warn('Trip cancel failed:', err);
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
