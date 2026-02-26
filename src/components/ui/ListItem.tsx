import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon } from '@/src/utils/scaling';

type ListItemVariant =
  | 'default'
  | 'outline'
  | 'secondary'
  | 'disabled'
  | 'danger'
  | 'selected'
  | 'special'
  | 'disabledSecondary';

type ListItemSize = 'big' | 'small';

interface ListItemProps {
  text: string;
  secondaryText?: string;
  variant?: ListItemVariant;
  size?: ListItemSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ListItem({
  text,
  secondaryText,
  variant = 'default',
  size = 'big',
  iconLeft,
  iconRight,
  onPress,
  style,
}: ListItemProps) {
  const isDisabled = variant === 'disabled' || variant === 'disabledSecondary';
  const isDanger = variant === 'danger';

  const containerStyle = [
    styles.container,
    size === 'big' ? styles.containerBig : styles.containerSmall,
    variant === 'outline' && styles.containerOutline,
    variant === 'selected' && styles.containerSelected,
    variant === 'disabled' && styles.containerDisabled,
    variant === 'secondary' && styles.containerSecondary,
    variant === 'disabledSecondary' && styles.containerDisabledSecondary,
    variant === 'danger' && styles.containerDanger,
    style,
  ];

  const textColor =
    isDisabled
      ? colors.button.disabledText
      : colors.white;

  const secondaryColor =
    isDisabled
      ? colors.button.disabledText
      : colors.gray[50];

  const content = (
    <View style={containerStyle}>
      <View style={styles.leftContent}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.primaryText,
              { color: textColor },
              variant === 'selected' && styles.primaryTextBold,
            ]}
            numberOfLines={1}
          >
            {text}
          </Text>
          {secondaryText && (
            <Text
              style={[styles.secondaryText, { color: secondaryColor }]}
              numberOfLines={2}
            >
              {secondaryText}
            </Text>
          )}
        </View>
      </View>
      {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
    </View>
  );

  if (isDanger) {
    return (
      <Pressable onPress={onPress} disabled={isDisabled}>
        {({ pressed }) => (
          <View style={[styles.dangerWrapper, pressed && styles.pressed]}>
            <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
            {content}
          </View>
        )}
      </Pressable>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  containerBig: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  containerSmall: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  containerOutline: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: borderRadius.md,
  },
  containerSelected: {
    borderWidth: 3,
    borderColor: colors.primary[400],
    borderRadius: borderRadius.md,
  },
  containerDisabled: {
    backgroundColor: colors.button.disabledBg,
    borderRadius: borderRadius.dialog,
    padding: spacing[4],
  },
  containerSecondary: {
    backgroundColor: colors.secondary[900],
    borderRadius: borderRadius.dialog,
    padding: spacing[4],
  },
  containerDisabledSecondary: {
    backgroundColor: '#1b132f',
    borderRadius: borderRadius.dialog,
    padding: spacing[4],
  },
  containerDanger: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  dangerWrapper: {
    borderWidth: 1,
    borderColor: colors.error[800],
    borderRadius: borderRadius.dialog,
    padding: spacing[4],
    overflow: 'hidden',
    backgroundColor: 'rgba(69, 10, 10, 0.26)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  iconLeft: {
    width: scaledIcon(24),
    height: scaledIcon(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: scaledSpacing(4),
  },
  primaryText: {
    ...typography.bodySmall,
    color: colors.white,
  },
  primaryTextBold: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  secondaryText: {
    ...typography.caption,
    color: colors.gray[50],
    lineHeight: scaledSpacing(18),
  },
  iconRight: {
    width: scaledIcon(24),
    height: scaledIcon(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
