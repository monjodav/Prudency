import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { Tag } from '@/src/components/ui/Tag';
import { getInitials } from '@/src/utils/formatters';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { TrustedContactRow } from '@/src/types/contact';

interface ContactListItemProps {
  contact: TrustedContactRow;
  onToggleFavorite: (contact: TrustedContactRow) => void;
  onDelete: (contact: TrustedContactRow) => void;
  onEdit: (contactId: string) => void;
  showSeparator?: boolean;
}

export function ContactListItem({
  contact,
  onToggleFavorite,
  onDelete,
  onEdit,
  showSeparator = false,
}: ContactListItemProps) {
  const isPending = contact.validation_status === 'pending';
  const isRefused = contact.validation_status === 'refused';

  return (
    <>
      <View style={styles.contactRow}>
        <View style={[styles.avatar, isPending && styles.avatarPending]}>
          <Text style={[styles.avatarText, isPending && styles.avatarTextPending]}>
            {getInitials(contact.name)}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text
            style={[styles.contactName, isPending && styles.contactNamePending]}
            numberOfLines={1}
          >
            {contact.name}
          </Text>
        </View>

        {isPending && (
          <Tag label="En cours de validation" variant="default" style={styles.tag} />
        )}
        {isRefused && (
          <Tag label="Refusé" variant="problem" style={styles.tag} />
        )}

        <Pressable
          style={styles.starButton}
          onPress={() => onToggleFavorite(contact)}
          hitSlop={8}
        >
          <Ionicons
            name={contact.is_favorite ? 'star' : 'star-outline'}
            size={scaledIcon(18)}
            color={contact.is_favorite ? colors.brandPosition[50] : colors.gray[500]}
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
              highlighted: !contact.is_favorite,
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
      {showSeparator && <View style={styles.separator} />}
    </>
  );
}

const AVATAR_SIZE = ms(46, 0.5);

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarPending: {
    opacity: 0.5,
  },
  avatarText: {
    ...typography.button,
    color: colors.primary[300],
  },
  avatarTextPending: {
    color: colors.primary[300],
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  contactNamePending: {
    color: '#888',
  },
  tag: {
    marginRight: spacing[2],
  },
  starButton: {
    padding: spacing[1],
    marginRight: spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: colors.secondary[800],
    marginHorizontal: spacing[3],
  },
});
