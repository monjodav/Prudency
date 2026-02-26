import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

interface DropdownMenuItem {
  label: string;
  onPress: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  style?: ViewStyle;
}

export function DropdownMenu({ items, style }: DropdownMenuProps) {
  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => (
        <Button
          key={index}
          title={item.label}
          variant="primary"
          onPress={item.onPress}
          fullWidth
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[950],
    borderRadius: borderRadius.dialog,
    padding: spacing[4],
    gap: spacing[2],
  },
});
