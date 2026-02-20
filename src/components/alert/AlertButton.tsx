import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { scaledFontSize, scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';

const LONG_PRESS_DURATION_MS = 3000;
const CANCEL_WINDOW_MS = 3000;

type ButtonState = 'idle' | 'cancel_window' | 'confirmed';

interface AlertButtonProps {
  onTrigger: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  size?: number;
}

export function AlertButton({
  onTrigger,
  onCancel,
  disabled = false,
  size = ms(120, 0.5),
}: AlertButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (buttonState !== 'cancel_window') return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    cancelTimer.current = setTimeout(() => {
      setButtonState('confirmed');
      onTrigger();
    }, CANCEL_WINDOW_MS);

    return () => {
      clearInterval(interval);
      if (cancelTimer.current) {
        clearTimeout(cancelTimer.current);
        cancelTimer.current = null;
      }
    };
  }, [buttonState, onTrigger]);

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
      if (disabled || buttonState !== 'idle') return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startPulse();
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();

      longPressTimer.current = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setButtonState('cancel_window');
        stopPulse();
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }, LONG_PRESS_DURATION_MS);
    },
    [disabled, buttonState, scaleAnim, startPulse, stopPulse]
  );

  const handlePressOut = useCallback(() => {
    if (buttonState !== 'idle') return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    stopPulse();
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [buttonState, scaleAnim, stopPulse]);

  const handleCancelPress = useCallback(() => {
    if (buttonState !== 'cancel_window') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (cancelTimer.current) {
      clearTimeout(cancelTimer.current);
      cancelTimer.current = null;
    }
    setButtonState('idle');
    onCancel?.();
  }, [buttonState, onCancel]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const isCancelWindow = buttonState === 'cancel_window';

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
          onPressIn={isCancelWindow ? undefined : handlePressIn}
          onPressOut={isCancelWindow ? undefined : handlePressOut}
          onPress={isCancelWindow ? handleCancelPress : undefined}
          disabled={disabled || buttonState === 'confirmed'}
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            isCancelWindow && styles.cancelWindowButton,
            disabled && styles.disabled,
          ]}
        >
          {isCancelWindow ? (
            <>
              <Text style={styles.cancelCountdown}>{countdown}</Text>
              <Text style={styles.cancelLabel}>Annuler</Text>
            </>
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={scaledIcon(40)} color={colors.alert.text} />
              <Text style={styles.label}>ALERTE</Text>
            </>
          )}
        </Pressable>
      </Animated.View>
      <Text style={styles.hint}>
        {isCancelWindow
          ? 'Appuyez pour annuler'
          : 'Appuie 3s pour alerter en urgence'}
      </Text>
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
  cancelWindowButton: {
    backgroundColor: colors.warning[600],
    shadowColor: colors.warning[600],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.buttonSmall,
    color: colors.alert.text,
    marginTop: spacing[1],
    letterSpacing: scaledFontSize(2),
  },
  cancelCountdown: {
    fontSize: scaledFontSize(36),
    fontWeight: '800',
    color: colors.white,
  },
  cancelLabel: {
    ...typography.buttonSmall,
    color: colors.white,
    marginTop: spacing[1],
  },
  hint: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[3],
  },
});
