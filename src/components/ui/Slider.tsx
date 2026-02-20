import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
}: SliderProps) {
  const trackWidth = useRef(0);
  const panX = useRef(new Animated.Value(0)).current;

  const fraction = (value - min) / (max - min);

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    panX.setValue(fraction * trackWidth.current);
  };

  const clampValue = (raw: number): number => {
    const clamped = Math.min(max, Math.max(min, raw));
    return Math.round(clamped / step) * step;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        panX.setOffset(fraction * trackWidth.current);
        panX.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.min(
          trackWidth.current,
          Math.max(0, fraction * trackWidth.current + gesture.dx),
        );
        panX.setValue(gesture.dx);
        const newFraction = newX / trackWidth.current;
        const newValue = clampValue(min + newFraction * (max - min));
        onChange(newValue);
      },
      onPanResponderRelease: () => {
        panX.flattenOffset();
        panX.setValue(fraction * trackWidth.current);
      },
    }),
  ).current;

  const displayValue = `${value}${unit}`;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
      <View style={styles.trackContainer} onLayout={handleLayout}>
        <View style={styles.track} />
        <View
          style={[
            styles.trackFilled,
            { width: `${fraction * 100}%` },
          ]}
        />
        <View
          style={[styles.thumb, { left: `${fraction * 100}%` }]}
          {...panResponder.panHandlers}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>{min}{unit}</Text>
        <Text style={styles.rangeText}>{max}{unit}</Text>
      </View>
    </View>
  );
}

const THUMB_SIZE = ms(24, 0.4);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[5],
  },
  disabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  label: {
    ...typography.bodySmall,
    color: colors.white,
  },
  value: {
    ...typography.bodySmall,
    color: colors.primary[300],
    fontWeight: '600',
  },
  trackContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: ms(4, 0.3),
    backgroundColor: colors.gray[700],
    borderRadius: borderRadius.full,
  },
  trackFilled: {
    position: 'absolute',
    height: ms(4, 0.3),
    backgroundColor: colors.primary[400],
    borderRadius: borderRadius.full,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    marginLeft: -THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary[400],
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  rangeText: {
    ...typography.caption,
    color: colors.gray[500],
  },
});
