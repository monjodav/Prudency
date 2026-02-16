import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
import { TRIP_STATUS } from '@/src/utils/constants';

export default function ActiveTripScreen() {
  const router = useRouter();
  const { lastKnownLat, lastKnownLng, batteryLevel } = useTripStore();
  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Placeholder: estimated arrival 30min from now
  const estimatedArrival = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const handleAlert = () => {
    // Placeholder: will use useAlert hook
    setShowAlertConfirmation(true);
  };

  const handleEndTrip = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndTrip = () => {
    // Placeholder: will use useTrip hook to complete trip
    setShowEndConfirmation(false);
    router.replace('/(trip)/complete');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TripStatusIndicator status={TRIP_STATUS.ACTIVE} style={styles.statusBadge} />

        <TripMap
          currentLat={lastKnownLat}
          currentLng={lastKnownLng}
          style={styles.map}
        />

        <TripTimer
          estimatedArrivalAt={estimatedArrival}
          style={styles.timer}
        />

        {batteryLevel != null && batteryLevel <= 15 && (
          <View style={styles.batteryWarning}>
            <FontAwesome
              name="battery-empty"
              size={16}
              color={colors.warning[700]}
            />
            <Text style={styles.batteryText}>
              Batterie faible ({batteryLevel}%)
            </Text>
          </View>
        )}

        <View style={styles.alertSection}>
          <AlertButton onTrigger={handleAlert} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionItem}
            onPress={() => router.push('/(trip)/notes')}
          >
            <FontAwesome name="pencil" size={20} color={colors.gray[600]} />
            <Text style={styles.actionLabel}>Notes</Text>
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handleEndTrip}>
            <FontAwesome name="check-circle" size={20} color={colors.success[600]} />
            <Text style={styles.actionLabel}>Terminer</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showAlertConfirmation}
        onClose={() => setShowAlertConfirmation(false)}
      >
        <AlertConfirmation
          contactCount={3}
          onDismiss={() => setShowAlertConfirmation(false)}
          onCancel={() => {
            // Placeholder: cancel alert
            setShowAlertConfirmation(false);
          }}
        />
      </Modal>

      <Modal
        visible={showEndConfirmation}
        onClose={() => setShowEndConfirmation(false)}
        title="Terminer le trajet ?"
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
