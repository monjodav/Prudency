import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useContacts } from '@/src/hooks/useContacts';
import { formatPhoneNumber, getInitials } from '@/src/utils/formatters';
import { scaledIcon, ms } from '@/src/utils/scaling';

export function GuardianTab() {
  const { contacts, isLoading } = useContacts();

  const pendingContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'pending'),
    [contacts],
  );

  const activeContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'accepted'),
    [contacts],
  );

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
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Valider</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeContacts.length > 0 && (
        <View style={styles.guardianSection}>
          <Text style={styles.sectionTitle}>Contacts</Text>
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
