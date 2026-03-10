import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { getStepIconInfo } from './directionIcons';
import type { RouteStep } from '@/src/services/directionsService';

interface StepIconProps {
  step: RouteStep;
  size: number;
  color?: string;
}

export function StepIcon({ step, size, color = colors.white }: StepIconProps) {
  const info = getStepIconInfo(step);

  if (info.roundaboutExit != null) {
    const badgeSize = size * 0.45;
    return (
      <View style={[styles.roundaboutContainer, { width: size * 1.2, height: size }]}>
        <MaterialIcons name={info.name} size={size} color={color} />
        <View
          style={[
            styles.exitBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -badgeSize * 0.15,
              right: -badgeSize * 0.15,
            },
          ]}
        >
          <Text style={[styles.exitText, { fontSize: size * 0.3 }]}>
            {info.roundaboutExit}
          </Text>
        </View>
      </View>
    );
  }

  return <MaterialIcons name={info.name} size={size} color={color} />;
}

const styles = StyleSheet.create({
  roundaboutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBadge: {
    position: 'absolute',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    color: colors.gray[900],
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
