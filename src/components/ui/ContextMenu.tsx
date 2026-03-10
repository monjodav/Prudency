import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal as RNModal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, ms } from '@/src/utils/scaling';

interface ContextMenuItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children?: React.ReactNode;
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);

  const handleItemPress = (item: ContextMenuItem) => {
    if (item.disabled) return;
    setVisible(false);
    item.onPress();
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)} hitSlop={8}>
        {children ?? (
          <View style={styles.defaultTrigger}>
            <Ionicons
              name="ellipsis-vertical"
              size={scaledIcon(20)}
              color={colors.gray[50]}
            />
          </View>
        )}
      </Pressable>

      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            {items.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.pill,
                  item.highlighted && styles.pillHighlighted,
                  item.destructive && styles.pillDestructive,
                  item.disabled && styles.pillDisabled,
                  pressed && !item.disabled && styles.pillPressed,
                ]}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
              >
                <Text
                  style={[
                    styles.pillText,
                    item.highlighted && styles.pillTextHighlighted,
                    item.destructive && styles.pillTextDestructive,
                    item.disabled && styles.pillTextDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={scaledIcon(16)}
                    color={
                      item.disabled
                        ? colors.gray[500]
                        : item.destructive || item.highlighted
                          ? colors.white
                          : colors.gray[300]
                    }
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </RNModal>
    </>
  );
}

const styles = StyleSheet.create({
  defaultTrigger: {
    padding: spacing[1],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: ms(260, 0.4),
    backgroundColor: colors.primary[950],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(14, 0.4),
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: spacing[2],
  },
  pillHighlighted: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillDestructive: {
    backgroundColor: colors.error[600],
    borderColor: colors.error[600],
  },
  pillPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillDisabled: {
    opacity: 0.4,
  },
  pillText: {
    ...typography.bodySmall,
    color: colors.gray[300],
    fontWeight: '500',
  },
  pillTextHighlighted: {
    color: colors.white,
    fontWeight: '600',
  },
  pillTextDestructive: {
    color: colors.white,
    fontWeight: '600',
  },
  pillTextDisabled: {
    color: colors.gray[500],
  },
});
