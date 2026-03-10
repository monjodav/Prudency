import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  DynamicIsland,
  useDynamicIsland,
} from '@/src/components/ui/DynamicIsland';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledFontSize } from '@/src/utils/scaling';
import { formatDuration } from '@/src/utils/formatters';

function TriggerContent() {
  const { arrivalAddress, estimatedDurationMinutes } = useTripStore();

  return (
    <View style={styles.triggerRow}>
      <Ionicons name="navigate" size={scaledIcon(14)} color={colors.primary[300]} />
      <Text style={styles.triggerDestination} numberOfLines={1}>
        {arrivalAddress ?? 'Trajet en cours'}
      </Text>
      {estimatedDurationMinutes != null && (
        <Text style={styles.triggerTime}>
          · {formatDuration(estimatedDurationMinutes)}
        </Text>
      )}
    </View>
  );
}

function ExpandedContent() {
  const router = useRouter();
  const { collapse } = useDynamicIsland();
  const { arrivalAddress } = useTripStore();
  const { remainingMinutes, isOvertime, trip } = useActiveTrip();

  const handleViewTrip = () => {
    collapse();
    router.push('/(trip)/active');
  };

  return (
    <View style={styles.expandedContainer}>
      <Text style={styles.expandedDestination} numberOfLines={2}>
        {arrivalAddress ?? 'Trajet en cours'}
      </Text>

      <View style={styles.expandedDetails}>
        <Text style={[styles.expandedTimer, isOvertime && styles.expandedTimerOvertime]}>
          {isOvertime
            ? 'En retard'
            : `${formatDuration(remainingMinutes)} restantes`}
        </Text>
        {trip?.transport_mode && (
          <View style={styles.transportBadge}>
            <Ionicons
              name={trip.transport_mode === 'walk' ? 'walk' : 'car'}
              size={scaledIcon(14)}
              color={colors.primary[300]}
            />
          </View>
        )}
      </View>

      <Pressable style={styles.viewTripButton} onPress={handleViewTrip}>
        <Text style={styles.viewTripText}>Voir le trajet</Text>
        <Ionicons name="chevron-forward" size={scaledIcon(14)} color={colors.white} />
      </Pressable>
    </View>
  );
}

export function ActiveTripIsland() {
  const { activeTripId } = useTripStore();

  if (!activeTripId) return null;

  return (
    <>
      <DynamicIsland.Trigger style={styles.trigger}>
        <TriggerContent />
      </DynamicIsland.Trigger>
      <DynamicIsland.Content>
        <ExpandedContent />
      </DynamicIsland.Content>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6, 0.3),
  },
  triggerDestination: {
    fontSize: scaledFontSize(13),
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
    flexShrink: 1,
    maxWidth: ms(120, 0.4),
  },
  triggerTime: {
    fontSize: scaledFontSize(12),
    fontFamily: 'Inter_400Regular',
    color: colors.primary[300],
  },
  expandedContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  expandedDestination: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  expandedDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  expandedTimer: {
    ...typography.bodySmall,
    color: colors.primary[200],
  },
  expandedTimerOvertime: {
    color: colors.error[500],
    fontWeight: '600',
  },
  transportBadge: {
    width: ms(24, 0.4),
    height: ms(24, 0.4),
    borderRadius: ms(12, 0.4),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: ms(8, 0.4),
  },
  viewTripText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
