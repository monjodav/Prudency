import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal as RNModal,
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
import { Tag } from '@/src/components/ui/Tag';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { ScreenBackground } from '@/src/components/ui/ScreenBackground';
import { useContacts } from '@/src/hooks/useContacts';
import { APP_CONFIG } from '@/src/utils/constants';
import { getInitials } from '@/src/utils/formatters';
import type { TrustedContactRow } from '@/src/types/contact';
import { Loader } from '@/src/components/ui/Loader';
import { scaledIcon, ms, mvs } from '@/src/utils/scaling';

const TABS = ['On me protège', 'Je protège'];
const AVATAR_SIZE = ms(46, 0.5);


function ContactCard({
  contact,
  onToggleFavorite,
  onDelete,
  onEdit,
  onPendingPress,
  showSeparator,
}: {
  contact: TrustedContactRow;
  onToggleFavorite: (c: TrustedContactRow) => void;
  onDelete: (c: TrustedContactRow) => void;
  onEdit: (id: string) => void;
  onPendingPress: () => void;
  showSeparator: boolean;
}) {
  const isPending = contact.validation_status === 'pending';
  const isRefused = contact.validation_status === 'refused';

  return (
    <>
      <View style={styles.contactRow}>
        {contact.avatar_uri ? (
          <Image source={{ uri: contact.avatar_uri }} style={[styles.avatar, styles.avatarImage, isPending && styles.avatarDim]} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, isPending && styles.avatarDim]}>
            <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
          </View>
        )}

        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, isPending && styles.contactNameDim]} numberOfLines={1}>
            {contact.name}
          </Text>
          {isPending && (
            <Pressable onPress={onPendingPress}>
              <Tag label="En cours de validation" variant="default" style={styles.tagBelow} />
            </Pressable>
          )}
          {isRefused && (
            <Tag label="Refusé" variant="problem" style={styles.tagBelow} />
          )}
        </View>

        {!isPending && !isRefused && (
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
        )}

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

export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tabIndex, setTabIndex] = useState(0);
  const { contacts, isLoading, deleteContact, toggleFavorite } = useContacts();

  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    variant: 'success' | 'error' | 'info';
  }>({ visible: false, title: '', variant: 'success' });

  const [infoVisible, setInfoVisible] = useState(false);

  const favorites = useMemo(() => contacts.filter((c) => c.is_favorite), [contacts]);
  const nonFavorites = useMemo(() => contacts.filter((c) => !c.is_favorite), [contacts]);

  const handlePendingPress = useCallback(() => {
    setSnackbar({
      visible: true,
      title: 'En cours de validation',
      subtitle: "Ton contact sera validé(e) une fois qu'il/elle acceptera son rôle. Tu peux l'informer pour accélérer la procédure.",
      variant: 'info',
    });
  }, []);

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
          title: 'Personne de confiance supprimé(e)',
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

  const renderCard = (contact: TrustedContactRow, isLast: boolean) => (
    <ContactCard
      key={contact.id}
      contact={contact}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onPendingPress={handlePendingPress}
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

      {tabIndex === 0 ? (
        <>
          {isLoading ? (
            <View style={styles.loadingState}>
              <Loader size="lg" color={colors.primary[300]} />
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="people-outline" size={scaledIcon(48)} color={colors.primary[400]} />
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Favoris</Text>
              </View>

              {favorites.length === 0 ? (
                <Text style={styles.emptySection}>Aucun favori pour le moment.</Text>
              ) : (
                <View style={styles.card}>
                  {favorites.map((contact, i) => renderCard(contact, i === favorites.length - 1))}
                </View>
              )}

              {/* Contacts enregistrés */}
              {nonFavorites.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contacts enregistrés</Text>
                  <View style={styles.card}>
                    {nonFavorites
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                      .map((contact, i) => renderCard(contact, i === nonFavorites.length - 1))}
                  </View>
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
            icon={<Ionicons name="information-circle" size={scaledIcon(20)} color={colors.white} />}
            variant="full"
            size="sm"
            style={styles.fabInfo}
            onPress={() => setInfoVisible(true)}
          />
        </>
      ) : (
        <GuardianTab />
      )}

      <RNModal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <Pressable style={styles.infoBackdrop} onPress={() => setInfoVisible(false)}>
          <View style={styles.infoSheet}>
            <Text style={styles.infoTitle}>Statuts de validation</Text>
            <Text style={styles.infoSubtitle}>
              Lorsque tu ajoutes une personne de confiance, elle doit accepter ton invitation.
            </Text>

            <View style={styles.infoRow}>
              <Tag label="En cours de validation" variant="default" />
              <Text style={styles.infoText}>
                La personne n'a pas encore répondu à ton invitation.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Tag label="Accepté" variant="valid" />
              <Text style={styles.infoText}>
                La personne a accepté(e) d'être ton contact de confiance.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Tag label="Refusé" variant="problem" />
              <Text style={styles.infoText}>
                La personne a décliné(e) ton invitation. Tu peux la supprimer et en ajouter une autre.
              </Text>
            </View>

            <Pressable style={styles.infoClose} onPress={() => setInfoVisible(false)}>
              <Text style={styles.infoCloseText}>Compris</Text>
            </Pressable>
          </View>
        </Pressable>
      </RNModal>

      <Snackbar
        visible={snackbar.visible}
        title={snackbar.title}
        subtitle={snackbar.subtitle}
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
    marginBottom: spacing[6],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[24],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: mvs(10, 0.3),
  },
  section: {
    marginTop: mvs(24, 0.3),
    gap: mvs(10, 0.3),
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.white,
  },
  emptySection: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
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
  avatarDim: {
    opacity: 0.5,
  },
  avatarText: {
    ...typography.button,
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
  contactNameDim: {
    color: colors.gray[500],
  },
  tagBelow: {
    marginTop: spacing[1],
    alignSelf: 'flex-start',
  },
  avatarImage: {
    overflow: 'hidden',
  },
  starButton: {
    padding: spacing[1],
    marginRight: spacing[1],
  },
  separator: {
    height: 1,
    backgroundColor: colors.secondary[800],
    marginHorizontal: spacing[4],
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
  infoBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSheet: {
    width: '85%',
    backgroundColor: colors.primary[950],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing[2],
  },
  infoSubtitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[5],
  },
  infoRow: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  infoText: {
    ...typography.caption,
    color: colors.gray[300],
    lineHeight: ms(18, 0.3),
  },
  infoClose: {
    alignSelf: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: spacing[2],
  },
  infoCloseText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
});
