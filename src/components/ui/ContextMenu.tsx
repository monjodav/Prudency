import React, { useRef, useState } from 'react';
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
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { scaledIcon, ms } from '@/src/utils/scaling';

interface ContextMenuItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children?: React.ReactNode;
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<View>(null);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, _width, height) => {
      setMenuPosition({ x: x - ms(160, 0.5), y: y + height + spacing[1] });
      setVisible(true);
    });
  };

  const handleItemPress = (item: ContextMenuItem) => {
    if (item.disabled) return;
    setVisible(false);
    item.onPress();
  };

  return (
    <>
      <Pressable ref={triggerRef} onPress={handleOpen} hitSlop={8}>
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
          <View
            style={[
              styles.menu,
              { top: menuPosition.y, left: menuPosition.x },
            ]}
          >
            {items.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  index < items.length - 1 && styles.menuItemBorder,
                  item.disabled && styles.menuItemDisabled,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.menuItemTextDestructive,
                    item.disabled && styles.menuItemTextDisabled,
                  ]}
                >
                  {item.label}
                </Text>
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={scaledIcon(18)}
                    color={
                      item.disabled
                        ? colors.gray[400]
                        : item.destructive
                          ? colors.white
                          : colors.white
                    }
                    style={styles.menuItemIcon}
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
  },
  menu: {
    position: 'absolute',
    minWidth: ms(180, 0.5),
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[400],
  },
  menuItemPressed: {
    backgroundColor: colors.primary[600],
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemIcon: {
    marginLeft: spacing[1],
  },
  menuItemText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '500',
  },
  menuItemTextDestructive: {
    color: colors.white,
  },
  menuItemTextDisabled: {
    color: colors.gray[300],
  },
});
