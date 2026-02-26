import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledFontSize } from '@/src/utils/scaling';
import { Radio } from '@/src/components/ui/Radio';

interface AlertTypeItemProps {
  emoji: string;
  title: string;
  description: string;
  selected?: boolean;
  onSelect?: () => void;
  showRadio?: boolean;
  style?: ViewStyle;
}

export function AlertTypeItem({
  emoji,
  title,
  description,
  selected = false,
  onSelect,
  showRadio = true,
  style,
}: AlertTypeItemProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
      {showRadio && (
        <Radio
          selected={selected}
          onSelect={onSelect ?? (() => {})}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  emoji: {
    fontSize: scaledFontSize(20),
    textAlign: 'center',
    width: ms(24, 0.4),
    height: ms(24, 0.4),
    lineHeight: ms(18, 0.4),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodySmall,
    color: colors.white,
    lineHeight: ms(18, 0.4),
  },
  description: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.6,
    lineHeight: ms(18, 0.4),
  },
});
