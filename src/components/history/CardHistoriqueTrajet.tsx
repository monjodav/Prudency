import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';
import { Tag, TagVariant } from '@/src/components/ui/Tag';

type TripHistoryStatus = 'completed' | 'cancelled' | 'alerted';

interface CardHistoriqueTrajetProps {
  destination: string;
  date: string;
  duration: string;
  status: TripHistoryStatus;
  onPress?: () => void;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<TripHistoryStatus, { label: string; variant: TagVariant }> = {
  completed: { label: 'Terminé', variant: 'valid' },
  cancelled: { label: 'Annulé', variant: 'neutral' },
  alerted: { label: 'Alerte', variant: 'problem' },
};

export function CardHistoriqueTrajet({
  destination,
  date,
  duration,
  status,
  onPress,
  style,
}: CardHistoriqueTrajetProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="walk" size={scaledIcon(24)} color={colors.white} />
            <View style={styles.headerText}>
              <Text style={styles.destination} numberOfLines={1}>
                {destination}
              </Text>
              <Text style={styles.date}>{date}</Text>
            </View>
          </View>
          <Tag label={config.label} variant={config.variant} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.durationLabel}>Durée</Text>
          <Text style={styles.durationValue}>{duration}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary[900],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: scaledSpacing(4),
  },
  destination: {
    ...typography.bodySmall,
    color: colors.white,
  },
  date: {
    ...typography.caption,
    color: colors.gray[50],
    lineHeight: ms(18, 0.4),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    ...typography.caption,
    color: colors.button.disabledText,
  },
  durationValue: {
    ...typography.bodySmall,
    color: colors.white,
  },
  pressed: {
    opacity: 0.7,
  },
});
