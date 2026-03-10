import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Loader } from '@/src/components/ui/Loader';
import { ms } from '@/src/utils/scaling';
import { usePastTrips, usePastAlerts } from '@/src/hooks/useHistory';
import { CardHistoriqueTrajet } from '@/src/components/history/CardHistoriqueTrajet';
import { CardHistoriqueAlerte } from '@/src/components/history/CardHistoriqueAlerte';
import { formatDate, formatDuration } from '@/src/utils/formatters';
import { TripRow } from '@/src/types/trip';
import { AlertRow } from '@/src/types/alert';
import { ALERT_TYPE } from '@/src/utils/constants';

type Tab = 'trips' | 'alerts';

type TripHistoryStatus = 'completed' | 'cancelled' | 'alerted';
type AlertHistoryStatus = 'active' | 'resolved' | 'expired' | 'deleted';

function mapTripStatus(status: string | null): TripHistoryStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'alerted' || status === 'alert' || status === 'timeout') return 'alerted';
  return 'completed';
}

function mapAlertStatus(alert: AlertRow): AlertHistoryStatus {
  if (alert.resolved_at) return 'resolved';
  if (alert.status === 'triggered' || alert.status === 'acknowledged') return 'active';
  return 'expired';
}

const ALERT_TYPE_EMOJI: Record<string, string> = {
  [ALERT_TYPE.MANUAL]: '🚨',
  [ALERT_TYPE.AUTOMATIC]: '⚡',
  [ALERT_TYPE.TIMEOUT]: '⏰',
  [ALERT_TYPE.INACTIVITY]: '😴',
  [ALERT_TYPE.DEVIATION]: '🔀',
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  [ALERT_TYPE.MANUAL]: 'Alerte manuelle',
  [ALERT_TYPE.AUTOMATIC]: 'Alerte automatique',
  [ALERT_TYPE.TIMEOUT]: 'Délai dépassé',
  [ALERT_TYPE.INACTIVITY]: 'Inactivité',
  [ALERT_TYPE.DEVIATION]: 'Déviation',
};

function computeDuration(trip: TripRow): string {
  if (trip.estimated_duration_minutes) {
    return formatDuration(trip.estimated_duration_minutes);
  }
  if (trip.started_at && (trip.completed_at ?? trip.cancelled_at)) {
    const start = new Date(trip.started_at).getTime();
    const end = new Date((trip.completed_at ?? trip.cancelled_at)!).getTime();
    const minutes = Math.round((end - start) / 60000);
    return formatDuration(Math.max(minutes, 1));
  }
  return '--';
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('trips');
  const { trips, isLoading: tripsLoading } = usePastTrips();
  const { alerts, isLoading: alertsLoading } = usePastAlerts();

  const isLoading = activeTab === 'trips' ? tripsLoading : alertsLoading;

  const renderTripItem = ({ item }: { item: TripRow }) => (
    <CardHistoriqueTrajet
      destination={item.arrival_address ?? 'Destination inconnue'}
      date={item.started_at ? formatDate(item.started_at) : '--'}
      duration={computeDuration(item)}
      status={mapTripStatus(item.status)}
      onPress={() => router.push({ pathname: '/(history)/trip/[id]', params: { id: item.id } })}
    />
  );

  const renderAlertItem = ({ item }: { item: AlertRow }) => (
    <CardHistoriqueAlerte
      emoji={ALERT_TYPE_EMOJI[item.type] ?? '🚨'}
      title={ALERT_TYPE_LABEL[item.type] ?? 'Alerte'}
      description={item.reason ?? 'Aucune raison spécifiée'}
      date={item.triggered_at ? formatDate(item.triggered_at) : '--'}
      status={mapAlertStatus(item)}
      onPress={() => router.push({ pathname: '/(history)/alert/[id]', params: { id: item.id } })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === 'trips'
          ? 'Aucun trajet passé'
          : 'Aucune alerte archivée'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'trips' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('trips')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'trips' && styles.tabTextActive,
            ]}
          >
            Trajets
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'alerts' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'alerts' && styles.tabTextActive,
            ]}
          >
            Alertes
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loader size="lg" />
        </View>
      ) : activeTab === 'trips' ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderTripItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing[4] },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing[4] },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmpty}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing[1],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.gray[400],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    flexGrow: 1,
  },
  separator: {
    height: spacing[2],
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
    paddingTop: ms(120, 0.5),
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[500],
  },
});
