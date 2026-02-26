import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { borderRadius } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';

export type TagVariant = 'default' | 'blue' | 'problem' | 'neutral' | 'pending' | 'valid';

interface TagProps {
  label: string;
  variant?: TagVariant;
  style?: ViewStyle;
}

const VARIANT_CONFIG: Record<TagVariant, { borderColor: string; bgColor: string }> = {
  default: { borderColor: '#cc63f9', bgColor: 'rgba(204, 99, 249, 0.25)' },
  blue: { borderColor: '#2c41bc', bgColor: 'rgba(44, 65, 188, 0.25)' },
  problem: { borderColor: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.25)' },
  neutral: { borderColor: '#5d5d5d', bgColor: 'rgba(93, 93, 93, 0.25)' },
  pending: { borderColor: '#f87171', bgColor: 'rgba(248, 113, 113, 0.25)' },
  valid: { borderColor: '#149744', bgColor: 'rgba(20, 151, 68, 0.25)' },
};

export function Tag({ label, variant = 'default', style }: TagProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.container,
        { borderColor: config.borderColor, backgroundColor: config.bgColor },
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
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
    fontWeight: '400',
  },
});
