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
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, scaledShadow, ms } from '@/src/utils/scaling';

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
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({ x: x - ms(120, 0.5), y: y + height + spacing[1] });
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
              color={colors.gray[400]}
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
                style={[
                  styles.menuItem,
                  index < items.length - 1 && styles.menuItemBorder,
                  item.disabled && styles.menuItemDisabled,
                ]}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={scaledIcon(18)}
                    color={
                      item.disabled
                        ? colors.gray[400]
                        : item.destructive
                          ? colors.error[500]
                          : colors.gray[900]
                    }
                    style={styles.menuItemIcon}
                  />
                )}
                <Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.menuItemTextDestructive,
                    item.disabled && styles.menuItemTextDisabled,
                  ]}
                >
                  {item.label}
                </Text>
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
    minWidth: ms(160, 0.5),
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[1],
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemIcon: {
    marginRight: spacing[3],
  },
  menuItemText: {
    ...typography.body,
    color: colors.gray[900],
  },
  menuItemTextDestructive: {
    color: colors.error[500],
  },
  menuItemTextDisabled: {
    color: colors.gray[400],
  },
});
