import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { ms, scaledSpacing, scaledShadow } from '@/src/utils/scaling';

type FABVariant = 'default' | 'active' | 'disabled' | 'full';
type FABSize = 'sm' | 'lg';

interface FABProps {
  icon: React.ReactNode;
  variant?: FABVariant;
  size?: FABSize;
  onPress?: () => void;
  style?: ViewStyle;
}

const GRADIENT_COLORS = [
  'rgba(0, 0, 0, 0.3)',
  'rgba(102, 102, 102, 0.3)',
] as const;

export function FAB({
  icon,
  variant = 'default',
  size = 'lg',
  onPress,
  style,
}: FABProps) {
  const isDisabled = variant === 'disabled';
  const sizeValue = size === 'lg' ? ms(59, 0.4) : ms(40, 0.4);
  const useGradient = variant === 'default' || variant === 'active';
  const isFull = variant === 'full';

  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
  };

  const content = (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        variant === 'default' && styles.default,
        variant === 'active' && styles.active,
        isDisabled && styles.disabled,
        isFull && styles.full,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {useGradient && (
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {useGradient && (
        <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      {icon}
    </Pressable>
  );

  return content;
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 26,
      elevation: 8,
    }),
  },
  default: {
    borderWidth: 0.25,
    borderColor: colors.white,
  },
  active: {
    borderWidth: 1,
    borderColor: colors.white,
  },
  disabled: {
    backgroundColor: '#404040',
  },
  full: {
    backgroundColor: colors.gray[900],
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
