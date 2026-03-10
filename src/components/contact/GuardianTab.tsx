import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useGuardianContacts } from '@/src/hooks/useGuardianContacts';
import { formatPhoneNumber, getInitials } from '@/src/utils/formatters';
import { Loader } from '@/src/components/ui/Loader';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { GuardianContact } from '@/src/types/contact';

export function GuardianTab() {
  const { guardianContacts, isLoading } = useGuardianContacts();

  const pendingContacts = useMemo(
    () => guardianContacts.filter((c) => c.validationStatus === 'pending'),
    [guardianContacts],
  );

  const activeContacts = useMemo(
    () => guardianContacts.filter((c) => c.validationStatus === 'accepted'),
    [guardianContacts],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <Loader size="lg" color={colors.primary[300]} />
      </View>
    );
  }

  if (guardianContacts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="shield-outline"
            size={scaledIcon(48)}
            color={colors.primary[400]}
          />
        </View>
        <Text style={styles.emptyTitle}>Aucun(e) protégé(e)</Text>
        <Text style={styles.emptyDescription}>
          Les personnes qui vous ajoutent comme contact de confiance apparaîtront ici
        </Text>
      </View>
    );
  }

  const getDisplayName = (contact: GuardianContact) =>
    [contact.ownerFirstName, contact.ownerLastName].filter(Boolean).join(' ') || 'Utilisateur Prudency';

  const getInitialsFromGuardian = (contact: GuardianContact) => {
    const name = getDisplayName(contact);
    return getInitials(name);
  };

  return (
    <View style={styles.guardianContainer}>
      {pendingContacts.length > 0 && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionTitle}>En attente</Text>
          {pendingContacts.map((contact) => (
            <View key={contact.id} style={styles.pendingCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitialsFromGuardian(contact)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{getDisplayName(contact)}</Text>
                {contact.ownerPhone && (
                  <Text style={styles.contactPhone}>
                    {formatPhoneNumber(contact.ownerPhone)}
                  </Text>
                )}
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>En attente</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeContacts.length > 0 && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionTitle}>Personnes que je protège</Text>
          {activeContacts.map((contact) => (
            <View key={contact.id} style={styles.guardianCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitialsFromGuardian(contact)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{getDisplayName(contact)}</Text>
                {contact.ownerPhone && (
                  <Text style={styles.contactPhone}>
                    {formatPhoneNumber(contact.ownerPhone)}
                  </Text>
                )}
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
