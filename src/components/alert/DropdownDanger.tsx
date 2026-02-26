import React, { useState, useCallback } from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';
import { AlertTypeList } from '@/src/components/alert/AlertTypeList';

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

interface DropdownDangerProps {
  sections: AlertSection[];
  selectedId?: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export function DropdownDanger({
  sections,
  selectedId,
  onSelect,
  style,
}: DropdownDangerProps) {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      setOpen(false);
    },
    [onSelect],
  );

  const selectedItem = sections
    .flatMap((s) => s.items)
    .find((item) => item.id === selectedId);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Type de danger</Text>
      <Pressable onPress={toggleOpen} style={styles.inputContainer}>
        <View style={styles.inputContent}>
          <Text style={styles.inputText}>
            {selectedItem
              ? `${selectedItem.emoji} ${selectedItem.title}`
              : 'Sélectionne le type de danger'}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={scaledIcon(24)}
            color={colors.gray[50]}
          />
        </View>
      </Pressable>
      {open && (
        <AlertTypeList
          sections={sections}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  label: {
    ...typography.label,
    color: colors.gray[50],
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.gray[50],
    borderRadius: borderRadius.md,
    height: ms(48, 0.5),
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    ...typography.bodySmall,
    color: colors.gray[50],
    flex: 1,
    letterSpacing: ms(-0.32, 0.4),
  },
});
