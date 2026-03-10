import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  Modal as RNModal,
  ScrollView,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography, fontFamilies } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms, mvs, scaledIcon, scaledFontSize, scaledLineHeight } from '@/src/utils/scaling';
import { ScreenBackground } from '@/src/components/ui/ScreenBackground';
import { FAB } from '@/src/components/ui/FAB';
import { Loader } from '@/src/components/ui/Loader';
import { useNotificationsQuery } from '@/src/hooks/useNotificationsQuery';
import type { NotificationRow, NotificationType } from '@/src/types/notification';

// ---------------------------------------------------------------------------
// Icon mapping (matches Figma design)
// ---------------------------------------------------------------------------

interface NotificationIconConfig {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}

function getIconConfig(type: NotificationType): NotificationIconConfig {
  switch (type) {
    case 'validation_required':
      return { name: 'checkmark-circle', color: colors.primary[300] };
    case 'alert_triggered':
    case 'contact_alert':
      return { name: 'alert-circle', color: colors.error[500] };
    case 'alert_acknowledged':
      return { name: 'alert-circle', color: colors.primary[300] };
    case 'overtime':
    case 'contact_timeout':
      return { name: 'time', color: colors.error[300] };
    case 'trip_started':
    case 'contact_trip_started':
      return { name: 'location', color: colors.brandPosition[50] };
    case 'trip_completed':
    case 'contact_arrival':
      return { name: 'location', color: colors.success[500] };
    case 'alert_comment':
      return { name: 'create', color: colors.primary[400] };
    case 'contact_accepted':
      return { name: 'happy', color: colors.gray[400] };
    case 'contact_refused':
      return { name: 'sad', color: colors.gray[500] };
    case 'approaching_arrival':
      return { name: 'time', color: colors.warning[400] };
    case 'anomaly_detected':
      return { name: 'warning', color: colors.warning[500] };
    case 'battery_low':
      return { name: 'battery-dead', color: colors.error[500] };
    case 'check_in_reminder':
      return { name: 'hand-left', color: colors.primary[400] };
    case 'connection_status':
      return { name: 'wifi', color: colors.gray[400] };
    default:
      return { name: 'notifications', color: colors.gray[400] };
  }
}

// ---------------------------------------------------------------------------
// Notification type legend (for info modal)
// ---------------------------------------------------------------------------

const NOTIFICATION_LEGEND: { type: NotificationType; label: string; description: string }[] = [
  { type: 'validation_required', label: 'Validation requise', description: 'Une personne de confiance a envoyé une demande.' },
  { type: 'alert_acknowledged', label: 'Alerte annulée', description: "L'alerte a été annulée, l'intervention n'est plus requise." },
  { type: 'alert_triggered', label: 'Alerte déclenchée', description: 'Alerte active — intervention requise.' },
  { type: 'overtime', label: 'Retard détecté', description: 'Aucun signal de fin reçu pour un trajet.' },
  { type: 'contact_trip_started', label: 'Localisation partagée', description: 'Un contact a démarré un trajet, suivi actif.' },
  { type: 'trip_completed', label: 'Trajet fini', description: 'Le contact a atteint sa destination.' },
  { type: 'alert_comment', label: 'Commentaire sur alerte', description: "Nouveau commentaire sur l'alerte." },
  { type: 'contact_accepted', label: 'Demande acceptée', description: 'Un contact a accepté ton invitation.' },
  { type: 'contact_refused', label: 'Demande refusée', description: 'Un contact a refusé ton invitation.' },
];

// ---------------------------------------------------------------------------
// Navigation targets
// ---------------------------------------------------------------------------

function getNavigationTarget(notification: NotificationRow): Href | null {
  switch (notification.type) {
    case 'trip_started':
    case 'approaching_arrival':
    case 'overtime':
    case 'check_in_reminder':
    case 'anomaly_detected':
    case 'battery_low':
    case 'connection_status':
    case 'alert_acknowledged':
      return '/(trip)/active';
    case 'alert_triggered':
    case 'contact_alert':
    case 'alert_comment':
      return '/(trip)/alert-active';
    case 'contact_trip_started':
    case 'contact_timeout':
    case 'contact_arrival': {
      const tripId = notification.data?.tripId;
      if (!tripId) return null;
      return { pathname: '/(guardian)/track', params: { tripId } };
    }
    case 'trip_completed':
      return '/(tabs)';
    case 'validation_required':
    case 'contact_accepted':
    case 'contact_refused':
      return '/(tabs)/contacts';
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Example notifications (shown when DB is empty so the screen is never blank)
// ---------------------------------------------------------------------------

const EXAMPLE_NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'ex-1',
    user_id: '',
    type: 'validation_required',
    title: 'Validation requise',
    body: 'Carole a envoyé une demande de validation.',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'ex-2',
    user_id: '',
    type: 'alert_acknowledged',
    title: 'Alerte déclenchée annulée',
    body: "Léa a annulé son alerte - l'intervention n'est plus requise",
    data: {},
    read: false,
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: 'ex-3',
    user_id: '',
    type: 'alert_triggered',
    title: 'Alerte déclenchée',
    body: 'Alerte de Léa - intervention requise\nAccéder à la localisation en temps réel.',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: 'ex-4',
    user_id: '',
    type: 'overtime',
    title: 'Retard détecté',
    body: 'Retard détecté sur le trajet de Léa\nAucun signal de fin reçu.',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'ex-5',
    user_id: '',
    type: 'contact_trip_started',
    title: 'Localisation partagée en direct',
    body: 'Léa a démarré un trajet\nSuivi actif.',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'ex-6',
    user_id: '',
    type: 'trip_completed',
    title: 'Trajet fini',
    body: 'Léa a atteint sa destination',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'ex-7',
    user_id: '',
    type: 'alert_comment',
    title: 'Nouveau commentaire sur une alerte',
    body: "Nouveau commentaire sur l'alerte",
    data: {},
    read: false,
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
  {
    id: 'ex-8',
    user_id: '',
    type: 'contact_accepted',
    title: 'Demande acceptée',
    body: 'Léa a accepté d\'être une personne de confiance',
    data: {},
    read: false,
    created_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
  },
  {
    id: 'ex-9',
    user_id: '',
    type: 'contact_refused',
    title: 'Demande refusée',
    body: "Ta personne de confiance n'a pas accepté ta demande",
    data: {},
    read: false,
    created_at: new Date(Date.now() - 72 * 3600_000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Relative time formatting
// ---------------------------------------------------------------------------

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;

  const isToday = date.getDate() === now.getDate()
    && date.getMonth() === now.getMonth()
    && date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate()
    && date.getMonth() === yesterday.getMonth()
    && date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Hier';

  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `Il y a ${days}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------------------
// Notification item component
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  notification: NotificationRow;
  onPress: (notification: NotificationRow) => void;
  isRead: boolean;
}

function NotificationItem({ notification, onPress, isRead }: NotificationItemProps) {
  const iconConfig = getIconConfig(notification.type);
  const showVoir = getNavigationTarget(notification) !== null;
  const timeLabel = formatRelativeTime(notification.created_at);

  return (
    <Pressable
      style={[styles.item, isRead && styles.itemRead]}
      onPress={() => onPress(notification)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}1A` }]}>
        <Ionicons
          name={iconConfig.name}
          size={scaledIcon(20)}
          color={iconConfig.color}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemTitleRow}>
          <Text style={[styles.itemTitle, isRead && styles.itemTitleRead]} numberOfLines={1}>
            {notification.title ?? 'Notification'}
          </Text>
          <Text style={[styles.itemTime, isRead && styles.itemTimeRead]}>{timeLabel}</Text>
        </View>
        {notification.body ? (
          <Text style={[styles.itemBody, isRead && styles.itemBodyRead]} numberOfLines={2}>
            {notification.body}
          </Text>
        ) : null}
      </View>
      {showVoir && (
        <Text style={[styles.voirLink, isRead && styles.voirLinkRead]}>Voir</Text>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

interface Section {
  title: string;
  data: NotificationRow[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notifications: realNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotificationsQuery(50);

  // Local read state (for example notifs + immediate UI feedback)
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  const notifications = realNotifications;

  const isRead = useCallback(
    (n: NotificationRow) => allMarkedRead || n.read || localReadIds.has(n.id),
    [allMarkedRead, localReadIds],
  );

  const sections = useMemo<Section[]>(() => {
    if (notifications.length === 0) return [];

    const recent: NotificationRow[] = [];
    const older: NotificationRow[] = [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const n of notifications) {
      const createdAt = n.created_at ? new Date(n.created_at).getTime() : 0;
      if (!isRead(n) || createdAt > oneDayAgo) {
        recent.push(n);
      } else {
        older.push(n);
      }
    }

    const result: Section[] = [];
    if (recent.length > 0) result.push({ title: 'Récentes', data: recent });
    if (older.length > 0) result.push({ title: 'Toutes les notifications', data: older });

    if (result.length === 1) {
      return [{ title: '', data: result[0]!.data }];
    }

    return result;
  }, [notifications, isRead]);

  const handlePress = useCallback(
    (notification: NotificationRow) => {
      // Mark as read locally
      setLocalReadIds((prev) => new Set(prev).add(notification.id));

      if (!notification.read) {
        markAsRead(notification.id);
      }

      const target = getNavigationTarget(notification);
      if (target) {
        router.push(target);
      }
    },
    [markAsRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    setAllMarkedRead(true);
    markAllAsRead();
  }, [markAllAsRead]);

  const hasUnread = notifications.some((n) => !isRead(n));

  const renderItem = useCallback(
    ({ item }: { item: NotificationRow }) => (
      <NotificationItem notification={item} onPress={handlePress} isRead={isRead(item)} />
    ),
    [handlePress, isRead],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => {
      if (!section.title) return null;
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      );
    },
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + mvs(12, 0.3) }]}>
      <ScreenBackground />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnread ? (
          <Pressable onPress={handleMarkAllRead} hitSlop={12}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </Pressable>
        ) : (
          <View style={{ width: scaledIcon(24) }} />
        )}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Loader size="lg" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={scaledIcon(48)} color={colors.gray[600]} />
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptyBody}>
            Tes notifications apparaîtront ici.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Info FAB */}
      <FAB
        icon={<Ionicons name="information-circle" size={scaledIcon(20)} color={colors.white} />}
        variant="full"
        size="sm"
        style={styles.fabInfo}
        onPress={() => setInfoVisible(true)}
      />

      {/* Info modal — scrollable full-screen legend + examples */}
      <RNModal
        visible={infoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={[styles.infoContainer, { paddingTop: insets.top + mvs(12, 0.3) }]}>
          <ScreenBackground />

          {/* Info header */}
          <View style={styles.header}>
            <Pressable onPress={() => setInfoVisible(false)} hitSlop={12}>
              <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>Types de notifications</Text>
            <View style={{ width: scaledIcon(24) }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.infoScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Legend */}
            <Text style={styles.infoSubtitle}>
              Voici les différentes notifications que tu peux recevoir.
            </Text>

            {NOTIFICATION_LEGEND.map((entry) => {
              const icon = getIconConfig(entry.type);
              return (
                <View key={entry.type} style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: `${icon.color}1A` }]}>
                    <Ionicons name={icon.name} size={scaledIcon(18)} color={icon.color} />
                  </View>
                  <View style={styles.infoRowText}>
                    <Text style={styles.infoLabel}>{entry.label}</Text>
                    <Text style={styles.infoDesc}>{entry.description}</Text>
                  </View>
                </View>
              );
            })}

            {/* Examples section */}
            <Text style={styles.infoExamplesTitle}>Exemples</Text>
            <View style={styles.infoExamplesList}>
              {EXAMPLE_NOTIFICATIONS.map((notif) => {
                const icon = getIconConfig(notif.type);
                return (
                  <View key={notif.id} style={styles.infoExampleItem}>
                    <View style={[styles.iconContainer, { backgroundColor: `${icon.color}1A` }]}>
                      <Ionicons name={icon.name} size={scaledIcon(20)} color={icon.color} />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      {notif.body ? (
                        <Text style={styles.itemBody} numberOfLines={2}>
                          {notif.body}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </RNModal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ICON_BOX = ms(36, 0.4);

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
  markAllText: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(12),
    color: colors.white,
    textDecorationLine: 'underline',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing[10],
  },
  sectionHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSeparator: {
    height: mvs(8, 0.3),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: ms(14, 0.4),
    gap: spacing[3],
  },
  itemRead: {
    opacity: 0.45,
  },
  iconContainer: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: ms(2, 0.4),
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  itemTitle: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(14),
    lineHeight: scaledLineHeight(17),
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  itemTitleRead: {
    color: colors.gray[300],
  },
  itemTime: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(11),
    color: colors.gray[400],
  },
  itemTimeRead: {
    color: colors.gray[500],
  },
  itemBody: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(12),
    lineHeight: scaledLineHeight(18),
    color: colors.gray[300],
  },
  itemBodyRead: {
    color: colors.gray[500],
  },
  voirLink: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(12),
    lineHeight: scaledLineHeight(15),
    color: colors.white,
    textDecorationLine: 'underline',
    marginLeft: spacing[2],
  },
  voirLinkRead: {
    color: colors.gray[500],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: spacing[5],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(16),
    fontWeight: '600',
    color: colors.gray[400],
  },
  emptyBody: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(13),
    color: colors.gray[500],
    textAlign: 'center',
  },
  fabInfo: {
    position: 'absolute',
    bottom: spacing[8],
    left: spacing[6],
  },
  infoContainer: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  infoScrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  infoSubtitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[5],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  infoIcon: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRowText: {
    flex: 1,
    gap: ms(2, 0.4),
  },
  infoLabel: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(14),
    fontWeight: '600',
    color: colors.white,
  },
  infoDesc: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: scaledFontSize(12),
    color: colors.gray[400],
    lineHeight: scaledLineHeight(16),
  },
  infoExamplesTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  infoExamplesList: {
    gap: spacing[1],
  },
  infoExampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(12, 0.4),
    gap: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
});
