import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { scaledIcon } from '@/src/utils/scaling';

type MarkerVariant = 'current' | 'departure' | 'arrival';

interface LocationMarkerProps {
  variant?: MarkerVariant;
  size?: number;
  style?: ViewStyle;
}

const variantColors: Record<MarkerVariant, string> = {
  current: colors.primary[500],
  departure: colors.success[500],
  arrival: colors.error[500],
};

/**
 * Custom marker visual for use inside react-native-maps <Marker>
 * or as a standalone location indicator.
 *
 * Usage with MapView:
 *   <Marker coordinate={...}>
 *     <LocationMarker variant="departure" />
 *   </Marker>
 */
export function LocationMarker({
  variant = 'current',
  size = scaledIcon(16),
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
