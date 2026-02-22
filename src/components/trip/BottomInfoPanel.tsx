import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { useTripTiming } from '@/src/hooks/useTripTiming';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { useActiveTrip } from '@/src/hooks/useActiveTrip';

interface BottomInfoPanelProps {
  trip: ReturnType<typeof useActiveTrip>['trip'];
  contactCount: number;
  isOvertime: boolean;
  onEndTrip: () => void;
  onPauseTrip: () => void;
  onExtendTrip: () => void;
  onCancelTrip: () => void;
  isCancelling: boolean;
}

export function BottomInfoPanel({
  trip,
  contactCount,
  isOvertime,
  onEndTrip,
  onPauseTrip,
  onExtendTrip,
  onCancelTrip,
  isCancelling,
}: BottomInfoPanelProps) {
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

const styles = StyleSheet.create({
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
});
