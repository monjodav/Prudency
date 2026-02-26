import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledRadius, scaledSpacing } from '@/src/utils/scaling';

type SegmentStatus = 'active' | 'completed' | 'upcoming';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  style?: ViewStyle;
}

function Segment({ status }: { status: SegmentStatus }) {
  return (
    <View style={styles.segmentWrapper}>
      <View
        style={[
          styles.segment,
          status === 'completed' && styles.segmentCompleted,
          status === 'active' && styles.segmentActive,
          status === 'upcoming' && styles.segmentUpcoming,
        ]}
      />
    </View>
  );
}

function getSegmentStatus(
  index: number,
  currentStep: number,
): SegmentStatus {
  if (index < currentStep) return 'completed';
  if (index === currentStep) return 'active';
  return 'upcoming';
}

export function ProgressIndicator({
  currentStep,
  totalSteps = 5,
  style,
}: ProgressIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Segment key={i} status={getSegmentStatus(i, currentStep)} />
      ))}
    </View>
  );
}

const SEGMENT_HEIGHT = ms(6, 0.4);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSpacing(9),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  segmentWrapper: {
    flex: 1,
    paddingVertical: spacing[2],
  },
  segment: {
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT / 2,
    width: '100%',
  },
  segmentCompleted: {
    backgroundColor: colors.primary[500],
  },
  segmentActive: {
    backgroundColor: colors.brandPosition[50],
  },
  segmentUpcoming: {
    backgroundColor: colors.gray[700],
  },
});
