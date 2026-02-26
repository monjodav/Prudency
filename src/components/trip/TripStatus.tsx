import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { TRIP_STATUS } from '@/src/utils/constants';
import { ms } from '@/src/utils/scaling';

interface TripStatusProps {
  status: string;
  style?: ViewStyle;
}

interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
  dotColor: string;
}

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case TRIP_STATUS.ACTIVE:
      return {
        label: 'Trajet en cours',
        color: colors.info[800],
        backgroundColor: colors.info[50],
        dotColor: colors.info[500],
      };
    case TRIP_STATUS.COMPLETED:
      return {
        label: 'Trajet termine',
        color: colors.success[800],
        backgroundColor: colors.success[50],
        dotColor: colors.success[500],
      };
    case TRIP_STATUS.TIMEOUT:
      return {
        label: 'Temps dépassé',
        color: colors.warning[800],
        backgroundColor: colors.warning[50],
        dotColor: colors.warning[500],
      };
    case TRIP_STATUS.ALERTED:
      return {
        label: 'Alerte declenchee',
        color: colors.error[800],
        backgroundColor: colors.error[50],
        dotColor: colors.error[500],
      };
    case TRIP_STATUS.CANCELLED:
      return {
        label: 'Trajet annule',
        color: colors.gray[700],
        backgroundColor: colors.gray[100],
        dotColor: colors.gray[500],
      };
    default:
      return {
        label: 'Brouillon',
        color: colors.gray[700],
        backgroundColor: colors.gray[100],
        dotColor: colors.gray[400],
      };
  }
}

export function TripStatusIndicator({ status, style }: TripStatusProps) {
  const config = getStatusConfig(status);

  return (
    <View
      style={[styles.container, { backgroundColor: config.backgroundColor }, style]}
    >
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: ms(8, 0.5),
    height: ms(8, 0.5),
    borderRadius: ms(8, 0.5) / 2,
    marginRight: spacing[2],
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
