import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { borderRadius } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';

type TagAlerteVariant = 'active' | 'resolved' | 'expired' | 'deleted';

interface TagAlerteProps {
  variant?: TagAlerteVariant;
  style?: ViewStyle;
}

const VARIANT_CONFIG: Record<
  TagAlerteVariant,
  { label: string; borderColor: string; bgColor: string }
> = {
  active: {
    label: 'Active',
    borderColor: colors.brandPosition[50],
    bgColor: 'rgba(204, 99, 249, 0.25)',
  },
  resolved: {
    label: 'Résolue',
    borderColor: colors.success[600],
    bgColor: 'rgba(50, 195, 73, 0.32)',
  },
  expired: {
    label: 'Expirée',
    borderColor: '#6d6d6d',
    bgColor: 'rgba(84, 84, 84, 0.32)',
  },
  deleted: {
    label: 'Supprimée',
    borderColor: colors.error[800],
    bgColor: 'rgba(238, 6, 6, 0.18)',
  },
};

export function TagAlerte({ variant = 'active', style }: TagAlerteProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.container,
        { borderColor: config.borderColor, backgroundColor: config.bgColor },
        style,
      ]}
    >
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
    borderRadius: borderRadius.tag,
    paddingHorizontal: ms(8, 0.5),
    paddingVertical: ms(4, 0.5),
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    color: colors.white,
  },
});
