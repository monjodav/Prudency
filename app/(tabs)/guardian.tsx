import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Badge } from '@/src/components/ui/Badge';
import { useContacts } from '@/src/hooks/useContacts';
import { formatPhoneNumber } from '@/src/utils/formatters';
import type { TrustedContactRow } from '@/src/types/contact';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

export default function GuardianScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contacts, isLoading } = useContacts();

  const pendingContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'pending'),
    [contacts],
  );

  const activeContacts = useMemo(
    () => contacts.filter((c) => c.validation_status === 'accepted'),
    [contacts],
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const renderContact = ({ item }: { item: TrustedContactRow }) => (
    <Pressable
      style={({ pressed }) => [
        styles.personCard,
        pressed && styles.personCardPressed,
      ]}
      onPress={() => {
        router.push({
          pathname: '/(guardian)/track',
          params: { personId: item.id },
        });
      }}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
      </View>

      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personPhone}>
          {formatPhoneNumber(item.phone)}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Badge label="Aucune activite" variant="default" />
        <Ionicons
          name="chevron-forward"
          size={scaledIcon(14)}
          color={colors.gray[500]}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.title}>Mes proteges</Text>
        <Text style={styles.subtitle}>
          {contacts.length} personne{contacts.length !== 1 ? 's' : ''} sous votre protection
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary[300]} />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="shield-outline" size={scaledIcon(48)} color={colors.primary[400]} />
          </View>
          <Text style={styles.emptyTitle}>Aucun protege</Text>
          <Text style={styles.emptyDescription}>
            Les personnes qui vous ajoutent comme contact de confiance apparaitront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...pendingContacts, ...activeContacts]}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            pendingContacts.length > 0 ? (
              <View style={styles.pendingSection}>
                <Text style={styles.sectionTitle}>
                  Contacts en attente de validation
                </Text>
                {pendingContacts.map((contact) => (
                  <View key={contact.id} style={styles.pendingCard}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {getInitials(contact.name)}
                      </Text>
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{contact.name}</Text>
                      <Text style={styles.personPhone}>
                        {formatPhoneNumber(contact.phone)}
                      </Text>
                    </View>
                    <View style={styles.validateBadge}>
                      <Text style={styles.validateBadgeText}>Valider</Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.sectionTitle}>Contacts</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  pendingSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.primary[200],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    marginTop: spacing[4],
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
  validateBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning[500],
  },
  validateBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing[3],
  },
  personCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  avatarPlaceholder: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary[300],
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  personPhone: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: spacing[2],
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
  },
});
