import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon } from '@/src/utils/scaling';
import { TripInfoContent } from '@/src/components/trip/BottomInfoPanel';
import type { TripInfoContentProps } from '@/src/components/trip/BottomInfoPanel';

interface TopStatusCardProps extends TripInfoContentProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const TIMING_CONFIG = {
  duration: 320,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export function TopStatusCard({
  isExpanded,
  onToggleExpand,
  isOvertime,
  ...infoProps
}: TopStatusCardProps) {
  const contentHeight = useSharedValue(0);
  const expandProgress = useSharedValue(0);

  const onContentLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      const measured = e.nativeEvent.layout.height;
      if (measured > 0) {
        contentHeight.value = measured;
      }
    },
    [contentHeight],
  );

  React.useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, TIMING_CONFIG);
  }, [isExpanded, expandProgress]);

  const animatedDropdownStyle = useAnimatedStyle(() => {
    if (contentHeight.value === 0) {
      return { height: 0, opacity: 0, overflow: 'hidden' as const };
    }
    return {
      height: expandProgress.value * contentHeight.value,
      opacity: expandProgress.value,
      overflow: 'hidden' as const,
    };
  });

  return (
    <View style={styles.topCard}>
      <View style={styles.header}>
        <Ionicons
          name={isOvertime ? 'warning' : 'walk'}
          size={scaledIcon(24)}
          color={isOvertime ? colors.warning[400] : colors.success[400]}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {isOvertime ? 'Temps dépassé' : 'Trajet en cours'}
          </Text>
          <Text style={styles.subtitle}>
            {isOvertime
              ? "Tu as dépassé ton heure d'arrivée"
              : 'Ton trajet a démarré'}
          </Text>
        </View>
        {!isOvertime && (
          <Pressable
            onPress={onToggleExpand}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isExpanded ? 'Masquer les détails du trajet' : 'Afficher les détails du trajet'}
          >
            <Ionicons
              name={isExpanded ? 'eye-outline' : 'eye-off-outline'}
              size={scaledIcon(20)}
              color={colors.gray[400]}
            />
          </Pressable>
        )}
      </View>

      <Animated.View style={animatedDropdownStyle}>
        <View
          onLayout={onContentLayout}
          style={[styles.dropdownContent, styles.dropdownMeasure]}
        >
          <TripInfoContent
            isOvertime={isOvertime}
            {...infoProps}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  topCard: {
    backgroundColor: 'rgba(4, 9, 36, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  subtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
  dropdownContent: {
    paddingTop: spacing[4],
  },
  dropdownMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
