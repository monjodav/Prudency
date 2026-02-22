import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { getInitials, formatPhoneNumber } from '@/src/utils/formatters';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { TrustedContactRow } from '@/src/types/contact';

interface ContactListItemProps {
  contact: TrustedContactRow;
  onToggleFavorite: (contact: TrustedContactRow) => void;
  onDelete: (contact: TrustedContactRow) => void;
  onEdit: (contactId: string) => void;
}

export function ContactListItem({
  contact,
  onToggleFavorite,
  onDelete,
  onEdit,
}: ContactListItemProps) {
  const isPending = contact.validation_status === 'pending';

  return (
    <View style={styles.contactRow}>
      <View style={[styles.avatar, contact.is_favorite && styles.avatarFavorite]}>
        <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.contactPhone}>{formatPhoneNumber(contact.phone)}</Text>
        {isPending && (
          <Text style={styles.pendingLabel}>En attente de validation</Text>
        )}
      </View>

      <Pressable
        style={styles.starButton}
        onPress={() => onToggleFavorite(contact)}
        hitSlop={8}
      >
        <Ionicons
          name={contact.is_favorite ? 'star' : 'star-outline'}
          size={scaledIcon(20)}
          color={contact.is_favorite ? colors.warning[400] : colors.gray[500]}
        />
      </Pressable>

      <ContextMenu
        items={[
          {
            label: 'Modifier',
            icon: 'pencil-outline',
            onPress: () => onEdit(contact.id),
          },
          {
            label: contact.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
            icon: contact.is_favorite ? 'star' : 'star-outline',
            onPress: () => onToggleFavorite(contact),
          },
          {
            label: 'Supprimer',
            icon: 'trash-outline',
            onPress: () => onDelete(contact),
            destructive: true,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing[2],
  },
  avatar: {
    width: ms(44, 0.5),
    height: ms(44, 0.5),
    borderRadius: ms(44, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarFavorite: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  avatarText: {
    ...typography.button,
    color: colors.primary[300],
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  contactPhone: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  pendingLabel: {
    ...typography.caption,
    color: colors.warning[400],
    marginTop: spacing[1],
  },
  starButton: {
    padding: spacing[2],
  },
});
