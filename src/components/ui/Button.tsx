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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { ms, scaledSpacing, scaledFontSize } from '@/src/utils/scaling';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'ghost'
  | 'social'
  | 'outlineViolet'
  | 'tertiary'
  | 'glass';

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

const variantStyles: Record<
  ButtonVariant,
  {
    container: ViewStyle;
    text: TextStyle;
    disabledContainer?: ViewStyle;
    disabledText?: TextStyle;
  }
> = {
  primary: {
    container: { backgroundColor: colors.primary[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  secondary: {
    container: { backgroundColor: colors.secondary[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  success: {
    container: { backgroundColor: colors.success[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  danger: {
    container: { backgroundColor: colors.error[500] },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  outline: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.primary[400],
    },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  social: {
    container: { backgroundColor: colors.gray[50] },
    text: { color: colors.gray[950] },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  outlineViolet: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.brandPosition[50],
    },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  tertiary: {
    container: { backgroundColor: colors.transparent },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
  },
  glass: {
    container: {
      backgroundColor: 'rgba(246, 246, 246, 0.3)',
      borderWidth: 0.3,
      borderColor: colors.white,
      overflow: 'hidden' as const,
    },
    text: { color: colors.white },
    disabledContainer: { backgroundColor: colors.button.disabledBg },
    disabledText: { color: colors.button.disabledText },
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

const pressedStyles: Partial<Record<ButtonVariant, ViewStyle>> = {
  primary: { backgroundColor: colors.primary[800] },
  secondary: { backgroundColor: colors.secondary[700] },
};

const TERTIARY_GRADIENT_COLORS = ['#0b114b', '#152dba', '#6f4287'] as const;

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

  const pressableContent = (
    <Pressable
      style={({ pressed }) => [
        variant !== 'tertiary' && styles.base,
        variantStyle.container,
        variant !== 'tertiary' && sizeStyle.container,
        variant !== 'tertiary' && fullWidth && styles.fullWidth,
        pressed && !isDisabled && pressedStyles[variant],
        pressed && !isDisabled && { transform: [{ scale: 0.98 }] },
        isDisabled && (variantStyle.disabledContainer || styles.disabled),
        variant !== 'tertiary' && style,
        variant === 'tertiary' && styles.tertiaryPressable,
      ]}
      disabled={isDisabled}
      {...pressableProps}
    >
      {variant === 'glass' && (
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
      )}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={String(variantStyle.text.color ?? colors.white)}
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

  if (variant === 'tertiary') {
    return (
      <LinearGradient
        colors={TERTIARY_GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, sizeStyle.container, fullWidth && styles.fullWidth, style]}
      >
        {pressableContent}
      </LinearGradient>
    );
  }

  return pressableContent;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.button.disabledBg,
  },
  disabledText: {
    color: colors.button.disabledText,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: ms(-0.32, 0.4),
  },
  iconLeft: {
    marginRight: scaledSpacing(8),
  },
  iconRight: {
    marginLeft: scaledSpacing(8),
  },
  tertiaryPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
