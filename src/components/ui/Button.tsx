import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary[500] },
    text: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.secondary[500] },
    text: { color: colors.white },
  },
  danger: {
    container: { backgroundColor: colors.error[500] },
    text: { color: colors.white },
  },
  outline: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 1.5,
      borderColor: colors.primary[500],
    },
    text: { color: colors.primary[500] },
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    text: { color: colors.primary[500] },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: spacing[2], paddingHorizontal: spacing[4] },
    text: { ...typography.buttonSmall },
  },
  md: {
    container: { paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
    text: { ...typography.button },
  },
  lg: {
    container: { paddingVertical: spacing[4], paddingHorizontal: spacing[8] },
    text: { ...typography.button, fontSize: 18 },
  },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...pressableProps
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text.color as string}
        />
      ) : (
        <Text style={[styles.text, variantStyle.text, sizeStyle.text]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
});
