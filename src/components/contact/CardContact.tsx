import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { Checkbox } from '@/src/components/ui/Checkbox';
import { Tag } from '@/src/components/ui/Tag';

type CardContactVariant = 'default' | 'selectable' | 'disabled';

interface CardContactProps {
  name: string;
  avatarUrl?: string;
  variant?: CardContactVariant;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  isFavorite?: boolean;
  tag?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CardContact({
  name,
  variant = 'default',
  checked = false,
  onToggle,
  isFavorite = false,
  tag,
  onPress,
  style,
}: CardContactProps) {
  const isDisabled = variant === 'disabled';
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [pressed && !isDisabled && styles.pressed]}
    >
      <View
        style={[
          styles.container,
          variant === 'default' && styles.containerDefault,
          style,
        ]}
      >
        <View style={styles.leftSection}>
          <View style={[styles.avatar, isDisabled && styles.avatarDisabled]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text
            style={[
              styles.name,
              isDisabled && styles.nameDisabled,
            ]}
          >
            {name}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {tag && <Tag label={tag} />}
          {isFavorite && (
            <Ionicons
              name="star"
              size={scaledIcon(24)}
              color={colors.warning[400]}
            />
          )}
          {onToggle && (
            <Checkbox
              checked={checked}
              onToggle={onToggle}
              state={isDisabled ? 'disabled' : 'default'}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const AVATAR_SIZE = ms(46, 0.4);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.dialog,
  },
  containerDefault: {
    backgroundColor: colors.secondary[800],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.gray[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDisabled: {
    opacity: 0.5,
  },
  initials: {
    ...typography.body,
    color: colors.gray[50],
  },
  name: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
  },
  nameDisabled: {
    color: colors.button.disabledText,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.7,
  },
});
