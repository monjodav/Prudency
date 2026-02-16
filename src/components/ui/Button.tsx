import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
  View,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { ms, scaledSpacing, scaledFontSize } from '@/src/utils/scaling';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'social';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; disabledContainer?: ViewStyle; disabledText?: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.gray[600] },
    disabledText: { color: colors.gray[500] },
  },
  secondary: {
    container: { backgroundColor: colors.secondary[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.gray[600] },
    disabledText: { color: colors.gray[500] },
  },
  danger: {
    container: { backgroundColor: colors.error[500] },
    text: { color: colors.white },
  },
  outline: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 1.5,
      borderColor: colors.primary[50],
    },
    text: { color: colors.primary[50] },
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    text: { color: colors.primary[50] },
  },
  social: {
    container: { backgroundColor: colors.gray[50] },
    text: { color: colors.gray[950] },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { height: ms(40, 0.5), paddingHorizontal: scaledSpacing(16) },
    text: { ...typography.buttonSmall },
  },
  md: {
    container: { height: ms(48, 0.5), paddingHorizontal: scaledSpacing(16) },
    text: { ...typography.button },
  },
  lg: {
    container: { height: ms(56, 0.5), paddingHorizontal: scaledSpacing(24) },
    text: { ...typography.button, fontSize: scaledFontSize(18) },
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
  icon,
  iconPosition = 'left',
  ...pressableProps
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && (variantStyle.disabledContainer || styles.disabled),
        style,
      ]}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text.color as string}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              variantStyle.text,
              sizeStyle.text,
              isDisabled && (variantStyle.disabledText || styles.disabledText),
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999, // Pill shape from Figma
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
    backgroundColor: colors.gray[600],
  },
  disabledText: {
    color: colors.gray[500],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: scaledSpacing(8),
  },
  iconRight: {
    marginLeft: scaledSpacing(8),
  },
});
