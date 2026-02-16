import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { Badge } from '@/src/components/ui/Badge';
import { formatDuration, formatDateTime } from '@/src/utils/formatters';
import { TRIP_STATUS } from '@/src/utils/constants';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface TripCardProps {
  status: string;
  estimatedDurationMinutes: number;
  departureAddress?: string | null;
  arrivalAddress?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  onPress?: () => void;
}

function getStatusBadge(status: string): { label: string; variant: BadgeVariant } {
  switch (status) {
    case TRIP_STATUS.ACTIVE:
      return { label: 'En cours', variant: 'info' };
    case TRIP_STATUS.COMPLETED:
      return { label: 'Termine', variant: 'success' };
    case TRIP_STATUS.CANCELLED:
      return { label: 'Annule', variant: 'default' };
    case TRIP_STATUS.TIMEOUT:
      return { label: 'Expiration', variant: 'warning' };
    case TRIP_STATUS.ALERTED:
      return { label: 'Alerte', variant: 'error' };
    default:
      return { label: 'Brouillon', variant: 'default' };
  }
}

export function TripCard({
  status,
  estimatedDurationMinutes,
  departureAddress,
  arrivalAddress,
  startedAt,
  completedAt,
  onPress,
}: TripCardProps) {
  const badge = getStatusBadge(status);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Badge label={badge.label} variant={badge.variant} />
        <Text style={styles.duration}>{formatDuration(estimatedDurationMinutes)}</Text>
      </View>

      {(departureAddress || arrivalAddress) && (
        <View style={styles.route}>
          {departureAddress && (
            <View style={styles.addressRow}>
              <FontAwesome
                name="circle-o"
                size={10}
                color={colors.primary[500]}
                style={styles.addressIcon}
              />
              <Text style={styles.addressText} numberOfLines={1}>
                {departureAddress}
              </Text>
            </View>
          )}
          {departureAddress && arrivalAddress && (
            <View style={styles.routeLine} />
          )}
          {arrivalAddress && (
            <View style={styles.addressRow}>
              <FontAwesome
                name="map-marker"
                size={14}
                color={colors.primary[500]}
                style={styles.addressIcon}
              />
              <Text style={styles.addressText} numberOfLines={1}>
                {arrivalAddress}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        {startedAt && (
          <Text style={styles.timeText}>
            Debut : {formatDateTime(startedAt)}
          </Text>
        )}
        {completedAt && (
          <Text style={styles.timeText}>
            Fin : {formatDateTime(completedAt)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadows.sm,
    marginBottom: spacing[3],
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  duration: {
    ...typography.bodySmall,
    color: colors.gray[600],
    fontWeight: '600',
  },
  route: {
    marginBottom: spacing[3],
    paddingLeft: spacing[1],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    width: 20,
    textAlign: 'center',
    marginRight: spacing[2],
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.gray[700],
    flex: 1,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray[300],
    marginLeft: 9,
    marginVertical: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: spacing[2],
  },
  timeText: {
    ...typography.caption,
    color: colors.gray[500],
  },
});
