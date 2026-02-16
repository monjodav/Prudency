import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { formatPhoneNumber } from '@/src/utils/formatters';

interface ContactCardProps {
  name: string;
  phone: string;
  email?: string | null;
  isPrimary?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}

export function ContactCard({
  name,
  phone,
  email,
  isPrimary = false,
  onPress,
  onDelete,
}: ContactCardProps) {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.avatar, isPrimary && styles.avatarPrimary]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isPrimary && (
            <FontAwesome
              name="star"
              size={12}
              color={colors.warning[500]}
              style={styles.starIcon}
            />
          )}
        </View>
        <Text style={styles.phone}>{formatPhoneNumber(phone)}</Text>
        {email && (
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        )}
      </View>

      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
          <FontAwesome name="trash-o" size={18} color={colors.error[400]} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pressed: {
    backgroundColor: colors.gray[50],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarPrimary: {
    backgroundColor: colors.primary[100],
  },
  initials: {
    ...typography.button,
    color: colors.secondary[700],
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  starIcon: {
    marginLeft: spacing[2],
  },
  phone: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginTop: 2,
  },
  email: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: 1,
  },
  deleteButton: {
    padding: spacing[2],
  },
});
