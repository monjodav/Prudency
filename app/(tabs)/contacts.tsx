import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { spacing, borderRadius } from '@/src/theme/spacing';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { useContacts } from '@/src/hooks/useContacts';
import { formatPhoneNumber } from '@/src/utils/formatters';
import { APP_CONFIG } from '@/src/utils/constants';
import type { TrustedContactRow } from '@/src/types/contact';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

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
    undoAction?: () => void;
  }>({ visible: false, title: '', variant: 'success' });

  const deletedContactRef = useRef<TrustedContactRow | null>(null);

  const { favorites, regular } = useMemo(() => {
    const favs: TrustedContactRow[] = [];
    const regs: TrustedContactRow[] = [];
    for (const c of contacts) {
      if (c.is_favorite) {
        favs.push(c);
      } else {
        regs.push(c);
      }
    }
    return { favorites: favs, regular: regs };
  }, [contacts]);

  const sections = useMemo(() => {
    const result: { title: string; data: TrustedContactRow[] }[] = [];
    if (favorites.length > 0) {
      result.push({ title: 'Favoris', data: favorites });
    }
    if (regular.length > 0) {
      result.push({ title: 'Contacts enregistres', data: regular });
    }
    return result;
  }, [favorites, regular]);

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
      deletedContactRef.current = contact;
      try {
        await deleteContact(contact.id);
        setSnackbar({
          visible: true,
          title: 'Personne de confiance supprimee',
          variant: 'error',
          undoAction: () => {
            // Undo not fully implemented -- would require re-creation
          },
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

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const renderContact = ({ item }: { item: TrustedContactRow }) => {
    const isPending = item.validation_status === 'pending';

    return (
      <View style={styles.contactRow}>
        <View style={[styles.avatar, item.is_favorite && styles.avatarFavorite]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.contactPhone}>{formatPhoneNumber(item.phone)}</Text>
          {isPending && (
            <Text style={styles.pendingLabel}>En attente de validation</Text>
          )}
        </View>

        <Pressable
          style={styles.starButton}
          onPress={() => handleToggleFavorite(item)}
          hitSlop={8}
        >
          <Ionicons
            name={item.is_favorite ? 'star' : 'star-outline'}
            size={scaledIcon(20)}
            color={item.is_favorite ? colors.warning[400] : colors.gray[500]}
          />
        </Pressable>

        <ContextMenu
          items={[
            {
              label: 'Modifier',
              icon: 'pencil-outline',
              onPress: () => {
                router.push({
                  pathname: '/(auth)/add-contact',
                  params: { editId: item.id },
                });
              },
            },
            {
              label: item.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
              icon: item.is_favorite ? 'star' : 'star-outline',
              onPress: () => handleToggleFavorite(item),
            },
            {
              label: 'Supprimer',
              icon: 'trash-outline',
              onPress: () => handleDelete(item),
              destructive: true,
            },
          ]}
        />
      </View>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string };
  }) => (
    <View style={styles.sectionHeader}>
      {section.title === 'Favoris' && (
        <Ionicons
          name="star"
          size={scaledIcon(14)}
          color={colors.warning[400]}
          style={styles.sectionIcon}
        />
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
        <Text style={styles.title}>Personnes de confiance</Text>
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
        En cas de probleme, une alerte est automatiquement envoyee a tes contacts favoris.
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
              onPress={() => router.push('/(auth)/add-contact')}
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
        action={
          snackbar.undoAction
            ? { label: 'Annuler', onPress: snackbar.undoAction }
            : undefined
        }
      />
    </View>
  );
}

function GuardianTab() {
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
                  {contact.name.charAt(0).toUpperCase()}
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
                  {contact.name.charAt(0).toUpperCase()}
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
  segmentContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
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
  sectionIcon: {
    marginRight: spacing[2],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.primary[200],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  guardianContainer: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  guardianSection: {
    marginBottom: spacing[4],
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
