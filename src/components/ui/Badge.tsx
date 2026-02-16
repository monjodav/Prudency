import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { container: ViewStyle; text: TextStyle }> = {
  default: {
    container: { backgroundColor: colors.gray[100] },
    text: { color: colors.gray[700] },
  },
  success: {
    container: { backgroundColor: colors.success[100] },
    text: { color: colors.success[800] },
  },
  warning: {
    container: { backgroundColor: colors.warning[100] },
    text: { color: colors.warning[800] },
  },
  error: {
    container: { backgroundColor: colors.error[100] },
    text: { color: colors.error[800] },
  },
  info: {
    container: { backgroundColor: colors.info[100] },
    text: { color: colors.info[800] },
  },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View style={[styles.container, variantStyle.container, style]}>
      <Text style={[styles.text, variantStyle.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
