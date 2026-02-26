import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { ms } from '@/src/utils/scaling';

interface ToggleProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const TRACK_WIDTH = ms(38, 0.4);
const TRACK_HEIGHT = ms(21, 0.4);
const THUMB_SIZE = ms(18, 0.4);
const TRACK_PADDING = ms(1.5, 0.4);
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

export function Toggle({
  active,
  onToggle,
  disabled = false,
  style,
}: ToggleProps) {
  const translateX = useRef(new Animated.Value(active ? TRAVEL : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: active ? TRAVEL : 0,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  }, [active, translateX]);

  return (
    <Pressable
      style={[
        styles.track,
        active ? styles.trackActive : styles.trackInactive,
        disabled && styles.trackDisabled,
        style,
      ]}
      onPress={() => onToggle(!active)}
      disabled={disabled}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.thumb,
          { transform: [{ translateX }] },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: '#32c349',
  },
  trackInactive: {
    backgroundColor: '#d8d8d8',
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
  },
});
