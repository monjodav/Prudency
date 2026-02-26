import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Vibration,
  GestureResponderEvent,
} from 'react-native';

const MESSAGE_FADE_DELAY = 10000;
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { scaledSpacing, ms } from '@/src/utils/scaling';

const ACTIVATE_DURATION_MS = 2000;
const CANCEL_DURATION_MS = 3000;

type ButtonState = 'idle' | 'message' | 'active';

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
  size = ms(59, 0.4),
}: AlertButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const activateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const buttonStateRef = useRef<ButtonState>('idle');
  const updateState = useCallback((state: ButtonState) => {
    buttonStateRef.current = state;
    setButtonState(state);
  }, []);

  // Fade in hint when message/active, fade out after 10s
  useEffect(() => {
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }

    if (buttonState === 'message' || buttonState === 'active') {
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (buttonState === 'message') {
        fadeTimer.current = setTimeout(() => {
          Animated.timing(hintOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => updateState('idle'));
        }, MESSAGE_FADE_DELAY);
      }
    } else {
      hintOpacity.setValue(0);
    }

    return () => {
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
        fadeTimer.current = null;
      }
    };
  }, [buttonState, hintOpacity]);

  // Continuous pulse when active
  useEffect(() => {
    if (buttonState !== 'active') return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => {
      loop.stop();
      pulseAnim.setValue(0);
    };
  }, [buttonState, pulseAnim]);

  const clearTimers = useCallback(() => {
    if (activateTimer.current) {
      clearTimeout(activateTimer.current);
      activateTimer.current = null;
    }
    if (cancelTimer.current) {
      clearTimeout(cancelTimer.current);
      cancelTimer.current = null;
    }
  }, []);

  // Single press handler — routes based on current state via ref
  const handlePressIn = useCallback(
    (_e: GestureResponderEvent) => {
      if (disabled) return;
      const state = buttonStateRef.current;

      if (state === 'active') {
        // Start cancel flow
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          useNativeDriver: true,
        }).start();

        cancelTimer.current = setTimeout(() => {
          Vibration.vibrate(200);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          updateState('idle');
          onCancel?.();
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }, CANCEL_DURATION_MS);
        return;
      }

      // Idle or message — show hint then start activate timer
      if (state === 'idle') {
        updateState('message');
      }

      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();

      activateTimer.current = setTimeout(() => {
        Vibration.vibrate([0, 300, 100, 300]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        updateState('active');
        onTrigger();
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }, ACTIVATE_DURATION_MS);
    },
    [disabled, scaleAnim, onTrigger, onCancel, updateState],
  );

  const handlePressOut = useCallback(() => {
    const state = buttonStateRef.current;

    if (state === 'active') {
      // Cancel the cancel timer
      if (cancelTimer.current) {
        clearTimeout(cancelTimer.current);
        cancelTimer.current = null;
      }
    } else {
      // Cancel the activate timer
      if (activateTimer.current) {
        clearTimeout(activateTimer.current);
        activateTimer.current = null;
      }
    }
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const isActive = buttonState === 'active';

  // Ring sizes — concentric circles
  const outerSize = size;
  const ring1Size = size * 0.85;
  const ring2Size = size * 0.7;
  const coreSize = size * 0.55;
  const iconSize = size * 0.3;

  const pulseSize = outerSize + scaledSpacing(16);
  const pulseOffset = (pulseSize - outerSize) / 2;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: outerSize, height: outerSize }}>
        {/* Pulse ring — centered behind button */}
        {isActive && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: pulseSize,
                height: pulseSize,
                borderRadius: pulseSize / 2,
                top: -pulseOffset,
                left: -pulseOffset,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
        )}
        <Animated.View style={[styles.buttonLayer, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.outerRing,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
            },
            isActive && styles.outerRingActive,
            disabled && styles.disabled,
          ]}
        >
          {/* Ring 1 — dark blue / dark red */}
          <View
            style={[
              styles.ring1,
              {
                width: ring1Size,
                height: ring1Size,
                borderRadius: ring1Size / 2,
              },
              isActive && styles.ring1Active,
            ]}
          />
          {/* Ring 2 — medium blue / medium red */}
          <View
            style={[
              styles.ring2,
              {
                width: ring2Size,
                height: ring2Size,
                borderRadius: ring2Size / 2,
              },
              isActive && styles.ring2Active,
            ]}
          />
          {/* Core — primary blue / bright red with icon */}
          <View
            style={[
              styles.core,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize / 2,
              },
              isActive && styles.coreActive,
            ]}
          >
            <View style={styles.iconStack}>
              <Ionicons
                name="shield"
                size={iconSize}
                color={colors.white}
              />
              <Text style={[styles.exclamation, isActive && styles.exclamationActive, { fontSize: iconSize * 0.5 }]}>!</Text>
            </View>
          </View>
        </Pressable>
        </Animated.View>
      </View>
      {/* Hint text */}
      <Animated.View style={[styles.hintContainer, { opacity: hintOpacity }]}>
        {isActive ? (
          <>
            <Text style={styles.hint}>
              Une alerte a été envoyée à ta personne de confiance.
            </Text>
            <Text style={styles.hintLight}>
              Reste appuyé sur le bouton pour désactiver l'alerte.
            </Text>
          </>
        ) : (
          <Text style={styles.hint}>
            Appuie 3s pour alerter en urgence ta personne de confiance
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: '#cc63f9',
  },
  outerRing: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: ms(25, 0.4),
    elevation: 8,
  },
  outerRingActive: {
    backgroundColor: 'rgba(180, 60, 120, 0.2)',
    borderColor: '#cc63f9',
  },
  ring1: {
    position: 'absolute',
    backgroundColor: colors.primary[800],
  },
  ring1Active: {
    backgroundColor: '#6a2070',
  },
  ring2: {
    position: 'absolute',
    backgroundColor: colors.primary[600],
  },
  ring2Active: {
    backgroundColor: '#9a30a0',
  },
  core: {
    position: 'absolute',
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreActive: {
    backgroundColor: '#cc63f9',
  },
  disabled: {
    opacity: 0.4,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamation: {
    position: 'absolute',
    color: colors.primary[500],
    fontWeight: '900',
    fontFamily: 'Inter_700Bold',
    marginTop: 1,
  },
  exclamationActive: {
    color: '#cc63f9',
  },
  hintContainer: {
    marginTop: spacing[2],
    alignItems: 'center',
    maxWidth: ms(260, 0.4),
  },
  hint: {
    fontSize: ms(13, 0.3),
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.white,
    textAlign: 'center',
  },
  hintLight: {
    fontSize: ms(13, 0.3),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing[1],
  },
});
