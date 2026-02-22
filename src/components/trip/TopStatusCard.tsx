import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, ms } from '@/src/utils/scaling';

interface TopStatusCardProps {
  isOvertime: boolean;
}

export function TopStatusCard({ isOvertime }: TopStatusCardProps) {
  return (
    <View style={styles.topCard}>
      <View style={styles.topCardContent}>
        <Ionicons
          name={isOvertime ? 'warning' : 'navigate-circle'}
          size={scaledIcon(24)}
          color={isOvertime ? colors.warning[400] : colors.success[400]}
        />
        <View style={styles.topCardText}>
          <Text style={styles.topCardTitle}>
            {isOvertime ? 'Temps depasse' : 'Trajet en cours'}
          </Text>
          <Text style={styles.topCardSubtitle}>
            {isOvertime
              ? 'Tu as depasse ton heure d\'arrivee'
              : 'Ton trajet a demarre'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topCard: {
    position: 'absolute',
    top: ms(60, 0.5),
    left: spacing[4],
    right: spacing[4],
    backgroundColor: 'rgba(4, 9, 36, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  topCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  topCardText: {
    flex: 1,
  },
  topCardTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  topCardSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
});
