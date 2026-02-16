import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { scaledFontSize, scaledSpacing, ms } from '@/src/utils/scaling';

const LONG_PRESS_DURATION_MS = 2000;

interface AlertButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
  size?: number;
}

export function AlertButton({
  onTrigger,
  disabled = false,
  size = ms(120, 0.5),
}: AlertButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(0);
  }, [pulseAnim]);

  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      if (disabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();

      longPressTimer.current = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onTrigger();
        stopPulse();
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }, LONG_PRESS_DURATION_MS);
    },
    [disabled, onTrigger, scaleAnim, startPulse, stopPulse]
  );

  const handlePressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    stopPulse();
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, stopPulse]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size + scaledSpacing(30),
            height: size + scaledSpacing(30),
            borderRadius: (size + scaledSpacing(30)) / 2,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.icon}>!</Text>
          <Text style={styles.label}>ALERTE</Text>
        </Pressable>
      </Animated.View>
      <Text style={styles.hint}>Maintenez pour alerter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: colors.alert.background,
  },
  button: {
    backgroundColor: colors.alert.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.alert.background,
    shadowOffset: { width: 0, height: scaledSpacing(6) },
    shadowOpacity: 0.4,
    shadowRadius: scaledSpacing(12),
    elevation: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: scaledFontSize(32),
    fontWeight: '800',
    color: colors.alert.text,
  },
  label: {
    ...typography.buttonSmall,
    color: colors.alert.text,
    marginTop: spacing[1],
    letterSpacing: scaledFontSize(2),
  },
  hint: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[3],
  },
});
