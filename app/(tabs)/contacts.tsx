import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
import { useContacts } from '@/src/hooks/useContacts';
import { APP_CONFIG } from '@/src/utils/constants';
import type { TrustedContactRow } from '@/src/types/contact';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

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
    <View style={styles.container}>
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.segmentContainer, { paddingTop: insets.top + spacing[16] }]}>
        <SegmentedControl
          options={TABS}
          selectedIndex={tabIndex}
          onChange={setTabIndex}
          variant="dark"
        />
      </View>

      <Text style={styles.description}>Les personnes qui reçoivent mes alertes</Text>

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
              {/* Favoris section */}
              <Text style={styles.sectionTitle}>Favoris</Text>
              {favorites.length === 0 ? (
                <View style={styles.cardBlock}>
                  <Text style={styles.emptyFavorites}>Aucun favoris pour le moment.</Text>
                </View>
              ) : (
                <View style={styles.cardBlock}>
                  {favorites.map((contact, index) =>
                    renderContactCard(contact, index === favorites.length - 1),
                  )}
                </View>
              )}

              {/* Contacts enregistrés section */}
              {letterGroups.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>
                    Contacts enregistrés
                  </Text>
                  {letterGroups.map((group) => (
                    <View key={group.letter} style={styles.letterGroup}>
                      <Text style={styles.letterLabel}>{group.letter}</Text>
                      <View style={styles.cardBlock}>
                        {group.items.map((contact, index) =>
                          renderContactCard(contact, index === group.items.length - 1),
                        )}
                      </View>
                    </View>
                  ))}
                </>
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
  container: { flex: 1, backgroundColor: colors.primary[950] },
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
  segmentContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
  description: {
    ...typography.caption,
    color: colors.primary[200],
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
  sectionTitle: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.gray[50],
    marginBottom: spacing[2],
  },
  sectionTitleSpacing: {
    marginTop: spacing[5],
  },
  cardBlock: {
    backgroundColor: colors.secondary[900],
    borderRadius: borderRadius.dialog,
    overflow: 'hidden',
  },
  emptyFavorites: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[5],
  },
  letterGroup: {
    marginTop: spacing[3],
  },
  letterLabel: {
    ...typography.caption,
    color: colors.gray[500],
    marginBottom: spacing[1],
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
