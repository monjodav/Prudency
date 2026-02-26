import React from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledShadow } from '@/src/utils/scaling';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
  variant?: 'light' | 'dark';
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  style,
  variant = 'light',
}: SegmentedControlProps) {
  const isDark = variant === 'dark';

  const handlePress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange(index);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark, style]}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.segment,
            isDark && styles.segmentDark,
            index === selectedIndex && styles.segmentSelected,
            index === selectedIndex && isDark && styles.segmentSelectedDark,
          ]}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.segmentText,
              isDark && styles.segmentTextDark,
              index === selectedIndex && styles.segmentTextSelected,
              index === selectedIndex && isDark && styles.segmentTextSelectedDark,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: scaledSpacing(4),
  },
  containerDark: {
    backgroundColor: colors.secondary[200],
    borderRadius: borderRadius.segmentTrack,
    paddingHorizontal: scaledSpacing(10),
    paddingVertical: scaledSpacing(8),
    gap: scaledSpacing(8),
  },
  segment: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  segmentDark: {
    borderRadius: borderRadius.segment,
    paddingVertical: spacing[2],
    paddingHorizontal: scaledSpacing(24),
  },
  segmentSelected: {
    backgroundColor: colors.white,
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }),
  },
  segmentSelectedDark: {
    backgroundColor: colors.secondary[800],
    borderRadius: borderRadius.segment,
  },
  segmentText: {
    ...typography.body,
    color: colors.gray[600],
  },
  segmentTextDark: {
    ...typography.bodySmall,
    color: colors.white,
  },
  segmentTextSelected: {
    color: colors.gray[900],
    fontWeight: '600',
  },
  segmentTextSelectedDark: {
    color: colors.white,
    fontWeight: '400',
  },
});
