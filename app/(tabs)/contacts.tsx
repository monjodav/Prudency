import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { GuardianTab } from '@/src/components/contact/GuardianTab';
import { ContactListItem } from '@/src/components/contact/ContactListItem';
import { useContacts } from '@/src/hooks/useContacts';
import { APP_CONFIG } from '@/src/utils/constants';
import type { TrustedContactRow } from '@/src/types/contact';
import { figmaScale, scaledIcon, scaledShadow, ms } from '@/src/utils/scaling';

const TABS = ['On me protege', 'Je protege'];

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
  const regular = useMemo(() => contacts.filter((c) => !c.is_favorite), [contacts]);

  const sections = useMemo(
    () =>
      [
        { title: 'Favoris', data: favorites },
        { title: 'Contacts enregistrés', data: regular },
      ].filter((s) => s.data.length > 0),
    [favorites, regular],
  );

  const handleToggleFavorite = useCallback(
    async (contact: TrustedContactRow) => {
      try {
        await toggleFavorite(contact.id, contact.is_favorite);
        setSnackbar({
          visible: true,
          title: contact.is_favorite ? 'Retire des favoris' : 'Ajoute aux favoris',
          variant: contact.is_favorite ? 'error' : 'success',
        });
      } catch {
        setSnackbar({
          visible: true,
          title: 'Erreur lors de la mise a jour',
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

  const renderContact = ({ item }: { item: TrustedContactRow }) => (
    <ContactListItem
      contact={item}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
      onEdit={(id) =>
        router.push({ pathname: '/(profile)/add-contact', params: { editId: id } })
      }
    />
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      {section.title === 'Favoris' && (
        <Ionicons name="star" size={scaledIcon(14)} color={colors.warning[400]} style={styles.sectionIcon} />
      )}
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const canAddMore = contacts.length < APP_CONFIG.MAX_TRUSTED_CONTACTS;

  return (
    <View style={styles.container}>
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Personnes de confiance</Text>
          <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
            <Ionicons name="settings-outline" size={scaledIcon(22)} color={colors.gray[400]} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {contacts.length}/{APP_CONFIG.MAX_TRUSTED_CONTACTS} contacts configures
        </Text>
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          options={TABS}
          selectedIndex={tabIndex}
          onChange={setTabIndex}
          variant="dark"
        />
      </View>

      <Text style={styles.helperText}>
        En cas de problème, une alerte est automatiquement envoyée à tes contacts favoris.
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
                Ajoutez des personnes de confiance qui seront prevenues en cas d'alerte
              </Text>
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderContact}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={false}
            />
          )}

          {canAddMore && (
            <Pressable
              style={styles.fab}
              onPress={() => router.push('/(profile)/add-contact')}
            >
              <Ionicons name="add" size={scaledIcon(28)} color={colors.white} />
            </Pressable>
          )}
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
  header: { paddingHorizontal: spacing[6], paddingBottom: spacing[4] },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  segmentContainer: { paddingHorizontal: spacing[6], marginBottom: spacing[3] },
  helperText: {
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
    paddingBottom: spacing[20],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginTop: spacing[2],
  },
  sectionIcon: { marginRight: spacing[2] },
  sectionTitle: {
    ...typography.label,
    color: colors.primary[200],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  fab: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing[6],
    width: ms(56, 0.5),
    height: ms(56, 0.5),
    borderRadius: ms(56, 0.5) / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
});
