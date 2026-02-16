import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' ? styles.elevated : styles.default,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    backgroundColor: colors.white,
  },
  default: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  elevated: {
    ...shadows.md,
  },
});
