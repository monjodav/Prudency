import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useContacts } from '@/src/hooks/useContacts';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { AcceptContactDialog } from '@/src/components/contact/AcceptContactDialog';
import { formatPhoneNumber, getInitials } from '@/src/utils/formatters';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { TrustedContactRow } from '@/src/types/contact';

export function GuardianTab() {
  const { contacts, isLoading, respondToInvitation, isRespondingToInvitation } = useContacts();

  const [selectedContact, setSelectedContact] = useState<TrustedContactRow | null>(null);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    title: string;
    variant: 'success' | 'error';
  }>({ visible: false, title: '', variant: 'success' });

  const pendingContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'pending'),
    [contacts],
  );

  const activeContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'accepted'),
    [contacts],
  );

  const handleValidatePress = useCallback((contact: TrustedContactRow) => {
    setSelectedContact(contact);
  }, []);

  const handleAccept = useCallback(async () => {
    if (!selectedContact) return;
    try {
      await respondToInvitation({ contactId: selectedContact.id, response: 'accepted' });
      setSnackbar({ visible: true, title: 'Demande acceptee', variant: 'success' });
      setSelectedContact(null);
    } catch {
      setSnackbar({ visible: true, title: 'Erreur lors de la validation', variant: 'error' });
    }
  }, [selectedContact, respondToInvitation]);

  const handleRefuse = useCallback(async () => {
    if (!selectedContact) return;
    try {
      await respondToInvitation({ contactId: selectedContact.id, response: 'refused' });
      setSnackbar({ visible: true, title: 'Demande refusee', variant: 'error' });
      setSelectedContact(null);
    } catch {
      setSnackbar({ visible: true, title: 'Erreur lors du refus', variant: 'error' });
    }
  }, [selectedContact, respondToInvitation]);

  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={colors.primary[300]} />
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="shield-outline"
            size={scaledIcon(48)}
            color={colors.primary[400]}
          />
        </View>
        <Text style={styles.emptyTitle}>Aucun protege</Text>
        <Text style={styles.emptyDescription}>
          Les personnes qui vous ajoutent comme contact de confiance apparaitront ici
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.guardianContainer}>
      {pendingContacts.length > 0 && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionTitle}>Contacts en attente de validation</Text>
          {pendingContacts.map((contact) => (
            <Pressable
              key={contact.id}
              style={styles.pendingCard}
              onPress={() => handleValidatePress(contact)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(contact.name)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>
                  {formatPhoneNumber(contact.phone)}
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Valider</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {activeContacts.length > 0 && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionTitle}>Contacts acceptes</Text>
          {activeContacts.map((contact) => (
            <View key={contact.id} style={styles.guardianCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(contact.name)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>
                  {formatPhoneNumber(contact.phone)}
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={scaledIcon(20)}
                color={colors.success[400]}
              />
            </View>
          ))}
        </View>
      )}

      <AcceptContactDialog
        visible={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        onAccept={handleAccept}
        onRefuse={handleRefuse}
        contactName={selectedContact?.name ?? ''}
        isProcessing={isRespondingToInvitation}
      />

      <Snackbar
        visible={snackbar.visible}
        title={snackbar.title}
        variant={snackbar.variant}
        onHide={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[10],
  },
  emptyIconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: ms(80, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.white,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.primary[200],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  guardianContainer: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  guardianSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.primary[200],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: spacing[2],
  },
  guardianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing[2],
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
  pendingBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning[500],
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
