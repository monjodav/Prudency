import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledFontSize, scaledIcon, ms } from '@/src/utils/scaling';

type TransportMode = 'transport' | 'voiture' | 'velo' | 'pied';

interface StatutTransportProps {
  mode: TransportMode;
  style?: ViewStyle;
}

const MODE_CONFIG: Record<TransportMode, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  transport: { icon: 'subway-outline', label: 'Transports' },
  voiture: { icon: 'car', label: 'Voiture' },
  velo: { icon: 'bicycle', label: 'Vélo' },
  pied: { icon: 'walk', label: 'À pied' },
};

export function StatutTransport({ mode, style }: StatutTransportProps) {
  const config = MODE_CONFIG[mode];

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={config.icon}
        size={scaledIcon(18)}
        color={colors.primary[400]}
      />
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: scaledFontSize(13),
    lineHeight: ms(19.5, 0.4),
    color: 'rgba(246, 246, 246, 0.6)',
    letterSpacing: ms(-0.08, 0.4),
  },
});
