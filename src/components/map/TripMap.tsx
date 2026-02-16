import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledFontSize, ms } from '@/src/utils/scaling';

interface TripMapProps {
  currentLat?: number | null;
  currentLng?: number | null;
  departureLat?: number | null;
  departureLng?: number | null;
  arrivalLat?: number | null;
  arrivalLng?: number | null;
  style?: ViewStyle;
}

export function TripMap({
  currentLat,
  currentLng,
  style,
}: TripMapProps) {
  const hasLocation = currentLat != null && currentLng != null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderIcon}>&#x1F5FA;</Text>
        <Text style={styles.placeholderText}>Carte du trajet</Text>
        {hasLocation && (
          <Text style={styles.coordsText}>
            {currentLat?.toFixed(4)}, {currentLng?.toFixed(4)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  mapPlaceholder: {
    height: ms(200, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  placeholderIcon: {
    fontSize: scaledFontSize(40),
    marginBottom: spacing[2],
  },
  placeholderText: {
    ...typography.body,
    color: colors.gray[500],
  },
  coordsText: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[1],
  },
});
