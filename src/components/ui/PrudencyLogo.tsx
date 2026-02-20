import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SplashLogo } from '@/src/components/splash/SplashLogo';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';

interface PrudencyLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { icon: 32, gap: spacing[1] },
  md: { icon: 48, gap: spacing[2] },
  lg: { icon: 57, gap: spacing[2] },
} as const;

export function PrudencyLogo({ size = 'md' }: PrudencyLogoProps) {
  const config = SIZES[size];

  return (
    <View style={styles.container}>
      <SplashLogo size={config.icon} />
      <Text style={[styles.text, { marginTop: config.gap }]}>
        PRUDENCY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    ...typography.logo,
    color: colors.white,
    letterSpacing: ms(4, 0.3),
  },
});
