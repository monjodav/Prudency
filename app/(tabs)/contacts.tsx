import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { FAB } from '@/src/components/ui/FAB';
import { GuardianTab } from '@/src/components/contact/GuardianTab';
import { ContactListItem } from '@/src/components/contact/ContactListItem';
import { ScreenBackground } from '@/src/components/ui/ScreenBackground';
import { useContacts } from '@/src/hooks/useContacts';
import { APP_CONFIG } from '@/src/utils/constants';
import type { TrustedContactRow } from '@/src/types/contact';
import { scaledIcon, ms, mvs } from '@/src/utils/scaling';

const TABS = ['On me protège', 'Je protège'];

function groupByLetter(contacts: TrustedContactRow[]): { letter: string; items: TrustedContactRow[] }[] {
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const groups: Record<string, TrustedContactRow[]> = {};

  for (const contact of sorted) {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(contact);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b, 'fr'))
    .map(([letter, items]) => ({ letter, items }));
}

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tabIndex, setTabIndex] = useState(0);
  const { contacts, isLoading, deleteContact, toggleFavorite } = useContacts();

  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    title: string;
    variant: 'success' | 'error';
  }>({ visible: false, title: '', variant: 'success' });

  const favorites = useMemo(() => contacts.filter((c) => c.is_favorite), [contacts]);
  const nonFavorites = useMemo(() => contacts.filter((c) => !c.is_favorite), [contacts]);
  const letterGroups = useMemo(() => groupByLetter(nonFavorites), [nonFavorites]);

  const handleToggleFavorite = useCallback(
    async (contact: TrustedContactRow) => {
      try {
        await toggleFavorite(contact.id, contact.is_favorite);
        setSnackbar({
          visible: true,
          title: contact.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
          variant: contact.is_favorite ? 'error' : 'success',
        });
      } catch {
        setSnackbar({
          visible: true,
          title: 'Erreur lors de la mise à jour',
          variant: 'error',
        });
      }
    },
    [toggleFavorite],
  );

  const handleDelete = useCallback(
    async (contact: TrustedContactRow) => {
      try {
        await deleteContact(contact.id);
        setSnackbar({
          visible: true,
          title: 'Personne de confiance supprimée',
          variant: 'error',
        });
      } catch {
        setSnackbar({
          visible: true,
          title: 'Erreur lors de la suppression',
          variant: 'error',
        });
      }
    },
    [deleteContact],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push({ pathname: '/(profile)/add-contact', params: { editId: id } });
    },
    [router],
  );

  const canAddMore = contacts.length < APP_CONFIG.MAX_TRUSTED_CONTACTS;

  const renderContactCard = (contact: TrustedContactRow, isLast: boolean) => (
    <ContactListItem
      key={contact.id}
      contact={contact}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
      onEdit={handleEdit}
      showSeparator={!isLast}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + mvs(12, 0.3) }]}>
      <ScreenBackground />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Personnes de confiance</Text>
        <View style={{ width: scaledIcon(24) }} />
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          options={TABS}
          selectedIndex={tabIndex}
          onChange={setTabIndex}
          variant="dark"
        />
      </View>

      <Text style={styles.description}>
        {tabIndex === 0
          ? 'Les personnes qui reçoivent mes alertes'
          : 'Les personnes que je protège au quotidien'}
      </Text>

      {tabIndex === 0 ? (
        <>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={colors.primary[300]} />
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="people-outline"
                  size={scaledIcon(48)}
                  color={colors.primary[400]}
                />
              </View>
              <Text style={styles.emptyTitle}>Aucun contact</Text>
              <Text style={styles.emptyDescription}>
                Ajoutez des personnes de confiance qui seront prévenues en cas d'alerte
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Favoris */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Favoris</Text>
                {favorites.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.emptyFavorites}>Aucun favoris pour le moment.</Text>
                  </View>
                ) : (
                  <View style={styles.card}>
                    {favorites.map((contact, index) =>
                      renderContactCard(contact, index === favorites.length - 1),
                    )}
                  </View>
                )}
              </View>

              {/* Contacts enregistrés */}
              {letterGroups.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contacts enregistrés</Text>
                  {letterGroups.map((group) => (
                    <View key={group.letter} style={styles.letterGroup}>
                      <Text style={styles.letterLabel}>{group.letter}</Text>
                      <View style={styles.card}>
                        {group.items.map((contact, index) =>
                          renderContactCard(contact, index === group.items.length - 1),
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {canAddMore && (
            <FAB
              icon={<Ionicons name="add" size={scaledIcon(26)} color={colors.white} />}
              variant="default"
              size="lg"
              onPress={() => router.push('/(profile)/add-contact')}
              style={styles.fabAdd}
            />
          )}

          <FAB
            icon={
              <Ionicons
                name="information-circle"
                size={scaledIcon(20)}
                color={colors.white}
              />
            }
            variant="full"
            size="sm"
            style={styles.fabInfo}
          />
        </>
      ) : (
        <GuardianTab />
      )}

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
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    marginBottom: mvs(20, 0.3),
  },
  headerTitle: {
    ...typography.body,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  segmentContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
  description: {
    ...typography.caption,
    color: colors.gray[400],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[24],
  },
  section: {
    marginTop: mvs(14, 0.3),
    gap: mvs(8, 0.3),
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  emptyFavorites: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[5],
  },
  letterGroup: {
    gap: mvs(4, 0.3),
  },
  letterLabel: {
    ...typography.caption,
    color: colors.gray[500],
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
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  fabAdd: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing[6],
  },
  fabInfo: {
    position: 'absolute',
    bottom: spacing[8],
    left: spacing[6],
  },
});
