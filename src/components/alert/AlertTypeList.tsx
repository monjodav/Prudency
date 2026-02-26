import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms } from '@/src/utils/scaling';
import { AlertTypeItem } from '@/src/components/alert/AlertTypeItem';

interface AlertType {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface AlertSection {
  title: string;
  items: AlertType[];
}

interface AlertTypeListProps {
  sections: AlertSection[];
  selectedId?: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export function AlertTypeList({
  sections,
  selectedId,
  onSelect,
  style,
}: AlertTypeListProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.itemList}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <AlertTypeItem
                    emoji={item.emoji}
                    title={item.title}
                    description={item.description}
                    selected={selectedId === item.id}
                    onSelect={() => onSelect(item.id)}
                  />
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(8, 18, 72, 0.76)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: spacing[4],
    gap: ms(30, 0.4),
  },
  section: {
    gap: spacing[4],
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.button.disabledText,
    lineHeight: ms(18, 0.4),
  },
  itemList: {
    gap: spacing[2],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
