import React from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledShadow } from '@/src/utils/scaling';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: object;
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  style,
}: SegmentedControlProps) {
  const handlePress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange(index);
  };

  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.segment,
            index === selectedIndex && styles.segmentSelected,
          ]}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.segmentText,
              index === selectedIndex && styles.segmentTextSelected,
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
  segment: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    borderRadius: borderRadius.md,
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
  segmentText: {
    ...typography.body,
    color: colors.gray[600],
  },
  segmentTextSelected: {
    color: colors.gray[900],
    fontWeight: '600',
  },
});
