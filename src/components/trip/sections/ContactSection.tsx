import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { ListItem } from '@/src/components/ui/ListItem';
import { Checkbox } from '@/src/components/ui/Checkbox';
import { Loader } from '@/src/components/ui/Loader';

interface Contact {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean | null;
  validation_status: 'pending' | 'accepted' | 'refused';
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: colors.gray[400] },
  accepted: { label: 'Confirmé', color: colors.success[400] },
  refused: { label: 'Refusé', color: colors.error[400] },
} as const;

function ContactAvatar({ name }: { name: string }) {
  const trimmed = name.trim();
  if (!trimmed) {
    return (
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>?</Text>
      </View>
    );
  }

  const parts = trimmed.split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0]![0]}${parts[parts.length - 1]![0]}`
    : trimmed.slice(0, 2);

  return (
    <View style={styles.contactAvatar}>
      <Text style={styles.contactAvatarText}>{initials.toUpperCase()}</Text>
    </View>
  );
}

interface ContactSectionProps {
  contacts: Contact[];
  contactsLoading: boolean;
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onShowAddContact: () => void;
}

export function ContactSection({
  contacts,
  contactsLoading,
  selectedContactId,
  onSelectContact,
  onShowAddContact,
}: ContactSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Contact</Text>
      {contactsLoading ? (
        <Loader size="sm" />
      ) : contacts.length === 0 ? (
        <>
          <Text style={styles.contactHint}>
            Pour activer les alertes pendant ton trajet,{' '}
            <Text style={styles.contactHintBold}>
              Prudency a besoin d'au moins une personne de confiance confirmé(e).
            </Text>
            {' '}La personne choisie doit avoir{' '}
            <Text style={styles.contactHintBold}>accepté(e) ce rôle</Text>
            {' '}pour pouvoir{' '}
            <Text style={styles.contactHintBold}>
              recevoir une alerte en cas de problème.
            </Text>
          </Text>
          <ListItem
            text="Ajouter un contact de confiance"
            variant="outline"
            iconRight={
              <Ionicons name="add" size={scaledIcon(20)} color={colors.primary[300]} />
            }
            onPress={onShowAddContact}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionHint}>
            Il sera alerté en cas de retard ou anomalie durant ton trajet.
          </Text>
          <View style={styles.contactsList}>
            {contacts.map((contact) => {
              const isSelected = selectedContactId === contact.id;
              const isAccepted = contact.validation_status === 'accepted';
              const status = STATUS_CONFIG[contact.validation_status];

              return (
                <Pressable
                  key={contact.id}
                  onPress={isAccepted ? () => onSelectContact(contact.id) : undefined}
                  style={[
                    styles.contactItem,
                    isSelected && styles.contactItemSelected,
                    !isAccepted && styles.contactItemDisabled,
                  ]}
                >
                  {isAccepted && (
                    <Checkbox
                      checked={isSelected}
                      onToggle={() => onSelectContact(contact.id)}
                    />
                  )}
                  <ContactAvatar name={contact.name} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={[styles.contactStatus, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <ListItem
            text="Ajouter un contact"
            variant="outline"
            iconRight={
              <Ionicons name="add" size={scaledIcon(20)} color={colors.primary[300]} />
            }
            onPress={onShowAddContact}
            style={styles.addContactBtn}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    ...typography.label,
    color: colors.gray[300],
    marginBottom: spacing[1],
  },
  sectionHint: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[3],
  },
  contactHint: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[3],
    lineHeight: ms(22, 0.4),
  },
  contactHintBold: {
    fontWeight: '700',
    color: colors.gray[300],
  },
  contactsList: {
    gap: spacing[2],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[3],
    gap: spacing[3],
  },
  contactItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactItemDisabled: {
    opacity: 0.6,
  },
  contactAvatar: {
    width: ms(36, 0.4),
    height: ms(36, 0.4),
    borderRadius: ms(18, 0.4),
    backgroundColor: colors.secondary[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: ms(13, 0.4),
  },
  contactInfo: {
    flex: 1,
    gap: ms(2, 0.3),
  },
  contactName: {
    ...typography.body,
    color: colors.white,
  },
  contactStatus: {
    ...typography.caption,
  },
  addContactBtn: {
    marginTop: spacing[2],
  },
});
