import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { formatTime, formatDuration } from '@/src/utils/formatters';
import { scaledIcon, scaledRadius, ms } from '@/src/utils/scaling';

export default function ScheduledTripScreen() {
  const router = useRouter();
  const { trip } = useActiveTrip();
  const { cancelTrip, isCancelling } = useTrip();
  const { startTracking } = useLocation();
  const { reset: resetTripStore } = useTripStore();

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [minutesUntilStart, setMinutesUntilStart] = useState(0);

  const scheduledAt = trip?.started_at
    ? new Date(trip.started_at)
    : new Date(Date.now() + 30 * 60 * 1000);

  const estimatedDuration = trip?.estimated_duration_minutes ?? 30;

  useEffect(() => {
    const update = () => {
      const diff = scheduledAt.getTime() - Date.now();
      setMinutesUntilStart(Math.max(0, Math.ceil(diff / 60000)));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  const getTimeUntilLabel = useCallback((): string => {
    if (minutesUntilStart <= 0) return 'Maintenant';
    if (minutesUntilStart === 1) return 'Dans 1 minute';
    return `Dans ${minutesUntilStart} minutes`;
  }, [minutesUntilStart]);

  const handleStartNow = async () => {
    setIsStarting(true);
    try {
      await startTracking();
      router.replace('/(trip)/active');
    } catch {
      setIsStarting(false);
    }
  };

  const handleModify = () => {
    router.push('/(trip)/create');
  };

  const handleCancelTrip = async () => {
    if (!trip) {
      setShowCancelConfirmation(false);
      router.replace('/(tabs)');
      return;
    }
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      setShowCancelConfirmation(false);
      router.replace('/(tabs)');
    } catch {
      setShowCancelConfirmation(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={scaledIcon(48)} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>Trajet programme</Text>
        <Text style={styles.timeUntil}>{getTimeUntilLabel()}</Text>
      </View>

      <View style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <Ionicons name="flag-outline" size={scaledIcon(18)} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Destination</Text>
            <Text style={styles.tripValue}>
              {trip?.arrival_address ?? 'Non definie'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <Ionicons name="calendar-outline" size={scaledIcon(18)} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Depart prevu</Text>
            <Text style={styles.tripValue}>{formatTime(scheduledAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <Ionicons name="hourglass-outline" size={scaledIcon(18)} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Duree estimee</Text>
            <Text style={styles.tripValue}>{formatDuration(estimatedDuration)}</Text>
          </View>
        </View>

      </View>

      <View style={styles.actions}>
        <Button
          title="Demarrer maintenant"
          onPress={handleStartNow}
          loading={isStarting}
          fullWidth
          size="lg"
          icon={<Ionicons name="play" size={scaledIcon(20)} color={colors.white} />}
        />
        <Button
          title="Modifier"
          variant="outline"
          onPress={handleModify}
          fullWidth
          icon={<Ionicons name="create-outline" size={scaledIcon(20)} color={colors.primary[50]} />}
        />
        <Pressable
          style={styles.cancelButton}
          onPress={() => setShowCancelConfirmation(true)}
        >
          <Text style={styles.cancelText}>Annuler le trajet</Text>
        </Pressable>
      </View>

      <View style={styles.noticeContainer}>
        <Ionicons name="information-circle-outline" size={scaledIcon(18)} color={colors.info[500]} />
        <Text style={styles.noticeText}>
          Vous recevrez une notification quand il sera l'heure de partir
        </Text>
      </View>

      <Modal
        visible={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        title="Annuler le trajet ?"
      >
        <Text style={styles.confirmText}>
          Le trajet programme sera annule. Vos contacts seront prevenus.
        </Text>
        <View style={styles.confirmActions}>
          <Button
            title="Non, garder"
            variant="outline"
            onPress={() => setShowCancelConfirmation(false)}
            style={styles.confirmButton}
          />
          <Button
            title="Oui, annuler"
            variant="danger"
            onPress={handleCancelTrip}
            loading={isCancelling}
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
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: ms(96, 0.5),
    height: ms(96, 0.5),
    borderRadius: ms(96, 0.5) / 2,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  timeUntil: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
    marginTop: spacing[2],
  },
  tripCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tripIcon: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: ms(40, 0.5) / 2,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  tripInfo: {
    flex: 1,
  },
  tripLabel: {
    ...typography.caption,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  tripValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
    marginTop: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing[4],
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  cancelText: {
    ...typography.body,
    color: colors.error[500],
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.info[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.info[700],
    flex: 1,
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
