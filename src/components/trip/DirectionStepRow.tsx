import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledFontSize, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { formatDistance } from './directionIcons';
import { StepIcon } from './StepIcon';
import type { RouteStep } from '@/src/services/directionsService';

interface DirectionStepRowProps {
  step: RouteStep;
  isActive: boolean;
  isLast: boolean;
}

function getStepColor(step: RouteStep): string {
  if (step.travelMode === 'TRANSIT' && step.transitDetails) {
    return step.transitDetails.line.color;
  }
  if (step.travelMode === 'WALKING') return '#959595';
  return '#2c41bc';
}

export function DirectionStepRow({ step, isActive, isLast }: DirectionStepRowProps) {
  const lineColor = getStepColor(step);

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      {/* Left gutter: vertical line + dot */}
      <View style={styles.gutter}>
        <View style={[styles.dot, { borderColor: lineColor }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: lineColor }]}>
        <StepIcon step={step} size={scaledIcon(16)} />
      </View>

      {/* Text content */}
      <View style={styles.content}>
        {step.travelMode === 'TRANSIT' && step.transitDetails ? (
          <>
            <View style={styles.transitHeader}>
              <View style={[styles.lineBadge, { backgroundColor: lineColor }]}>
                <Text style={[styles.lineBadgeText, { color: step.transitDetails.line.textColor }]}>
                  {step.transitDetails.line.shortName || step.transitDetails.line.name}
                </Text>
              </View>
              <Text style={styles.distance}>{formatDistance(step.distance.value)}</Text>
            </View>
            <Text style={styles.instruction} numberOfLines={2}>
              {step.transitDetails.departureStop.name} → {step.transitDetails.arrivalStop.name}
            </Text>
            <Text style={styles.subtitle}>
              {step.transitDetails.numStops} arrêts
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.instruction} numberOfLines={2}>
              {step.instruction}
            </Text>
            <Text style={styles.distance}>{formatDistance(step.distance.value)}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  activeContainer: {
    backgroundColor: 'rgba(204, 99, 249, 0.1)',
    borderRadius: scaledRadius(8),
  },
  gutter: {
    width: ms(20, 0.4),
    alignItems: 'center',
    marginRight: spacing[2],
  },
  dot: {
    width: ms(10, 0.4),
    height: ms(10, 0.4),
    borderRadius: ms(5, 0.4),
    backgroundColor: colors.white,
    borderWidth: 2.5,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: ms(30, 0.4),
    marginTop: spacing[1],
  },
  iconContainer: {
    width: ms(28, 0.4),
    height: ms(28, 0.4),
    borderRadius: ms(14, 0.4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  transitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  lineBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: scaledRadius(4),
  },
  lineBadgeText: {
    fontSize: scaledFontSize(11),
    fontFamily: 'Inter_700Bold',
  },
  instruction: {
    fontSize: scaledFontSize(13),
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    lineHeight: ms(18, 0.3),
  },
  distance: {
    fontSize: scaledFontSize(11),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[400],
  },
  subtitle: {
    fontSize: scaledFontSize(11),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[400],
  },
});
