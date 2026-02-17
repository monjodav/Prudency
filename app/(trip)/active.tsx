import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { AlertConfirmation } from '@/src/components/alert/AlertConfirmation';
import { TripTimer } from '@/src/components/trip/TripTimer';
import { TripStatusIndicator } from '@/src/components/trip/TripStatus';
import { TripMap } from '@/src/components/map/TripMap';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { fetchDirections } from '@/src/services/directionsService';
import { TRIP_STATUS } from '@/src/utils/constants';
import { scaledIcon } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';

export default function ActiveTripScreen() {
  const router = useRouter();
  const { lastKnownLat, lastKnownLng, batteryLevel } = useTripStore();
  const { trip } = useActiveTrip();
  const { completeTrip, isCompleting } = useTrip();
  const { triggerAlert, isTriggering } = useAlert();
  const { startTracking, stopTracking, isTracking } = useLocation();
  const { contacts } = useContacts();

  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
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

  const estimatedArrival = trip?.estimated_arrival_at
    ?? new Date(Date.now() + 30 * 60 * 1000).toISOString();

  useEffect(() => {
    if (!isTracking) {
      startTracking().catch(() => {
        // Permission denied or error; tracking not started
      });
    }
  }, [isTracking, startTracking]);

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
      router.replace('/(trip)/paused');
    } catch {
      // Stop tracking failed, still navigate to paused
      router.replace('/(trip)/paused');
    }
  };

  const handleEndTrip = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndTrip = async () => {
    if (!trip) return;
    try {
      await stopTracking();
      await completeTrip(trip.id);
      setShowEndConfirmation(false);
      router.replace('/(trip)/complete');
    } catch {
      setShowEndConfirmation(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TripStatusIndicator status={TRIP_STATUS.ACTIVE} style={styles.statusBadge} />

        <TripMap
          departure={departure}
          arrival={arrival}
          routeCoordinates={route?.polyline}
          showUserLocation
          userLocation={lastKnownLat != null && lastKnownLng != null
            ? { lat: lastKnownLat, lng: lastKnownLng }
            : undefined}
          style={styles.map}
        />

        <TripTimer
          estimatedArrivalAt={estimatedArrival}
          style={styles.timer}
        />

        {batteryLevel != null && batteryLevel <= 15 && (
          <View style={styles.batteryWarning}>
            <Ionicons
              name="battery-dead-outline"
              size={scaledIcon(18)}
              color={colors.warning[700]}
            />
            <Text style={styles.batteryText}>
              Batterie faible ({batteryLevel}%)
            </Text>
          </View>
        )}

        <View style={styles.alertSection}>
          <AlertButton onTrigger={handleAlert} disabled={isTriggering} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionItem}
            onPress={() => router.push('/(trip)/notes')}
          >
            <Ionicons name="document-text-outline" size={scaledIcon(22)} color={colors.gray[600]} />
            <Text style={styles.actionLabel}>Notes</Text>
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handlePause}>
            <Ionicons name="pause-circle-outline" size={scaledIcon(22)} color={colors.warning[600]} />
            <Text style={styles.actionLabel}>Pause</Text>
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handleEndTrip}>
            <Ionicons name="checkmark-circle-outline" size={scaledIcon(22)} color={colors.success[600]} />
            <Text style={styles.actionLabel}>Arrivee</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showAlertConfirmation}
        onClose={() => setShowAlertConfirmation(false)}
      >
        <AlertConfirmation
          contactCount={contacts.length}
          onDismiss={() => setShowAlertConfirmation(false)}
          onCancel={() => {
            setShowAlertConfirmation(false);
          }}
        />
      </Modal>

      <Modal
        visible={showEndConfirmation}
        onClose={() => setShowEndConfirmation(false)}
        title="Je suis arrivee"
      >
        <Text style={styles.confirmText}>
          Confirmez que vous etes bien arrivee a destination.
        </Text>
        <View style={styles.confirmActions}>
          <Button
            title="Annuler"
            variant="outline"
            onPress={() => setShowEndConfirmation(false)}
            style={styles.confirmButton}
          />
          <Button
            title="Confirmer"
            onPress={confirmEndTrip}
            loading={isCompleting}
            style={styles.confirmButton}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  statusBadge: {
    marginBottom: spacing[4],
  },
  map: {
    marginBottom: spacing[4],
  },
  timer: {
    marginBottom: spacing[6],
  },
  batteryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  batteryText: {
    ...typography.bodySmall,
    color: colors.warning[700],
  },
  alertSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[10],
  },
  actionItem: {
    alignItems: 'center',
    gap: spacing[1],
  },
  actionLabel: {
    ...typography.caption,
    color: colors.gray[600],
  },
  confirmText: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[6],
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  confirmButton: {
    flex: 1,
  },
});
