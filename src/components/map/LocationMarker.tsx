import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';

type MarkerVariant = 'current' | 'departure' | 'arrival';

interface LocationMarkerProps {
  variant?: MarkerVariant;
  size?: number;
  style?: ViewStyle;
}

const variantColors: Record<MarkerVariant, string> = {
  current: colors.primary[500],
  departure: colors.info[500],
  arrival: colors.success[500],
};

export function LocationMarker({
  variant = 'current',
  size = 16,
  style,
}: LocationMarkerProps) {
  const color = variantColors[variant];

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.innerDot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  innerDot: {},
});
