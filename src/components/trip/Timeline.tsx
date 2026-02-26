import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';
import { SplashLogo } from '@/src/components/splash/SplashLogo';

type TimelinePosition = 'begin' | 'middle' | 'end';

interface TimelineProps {
  position?: TimelinePosition;
  style?: ViewStyle;
}

const SEGMENT_HEIGHT = ms(6, 0.4);
const LOGO_SIZE = ms(30, 0.4);

export function Timeline({ position = 'middle', style }: TimelineProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <View style={[styles.segment, styles.segmentActive]} />
        <View style={[styles.segment, styles.segmentCompleted]} />
      </View>
      <View
        style={[
          styles.logoContainer,
          position === 'begin' && styles.logoBegin,
          position === 'middle' && styles.logoMiddle,
          position === 'end' && styles.logoEnd,
        ]}
      >
        <SplashLogo size={LOGO_SIZE} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ms(24, 0.4),
    width: '100%',
  },
  track: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    top: ms(9, 0.4),
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT / 2,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
  },
  segmentActive: {
    backgroundColor: colors.brandPosition[50],
  },
  segmentCompleted: {
    backgroundColor: colors.primary[500],
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logoBegin: {
    left: 0,
  },
  logoMiddle: {
    left: '50%',
    marginLeft: -(LOGO_SIZE / 2),
  },
  logoEnd: {
    right: 0,
  },
});
