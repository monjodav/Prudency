import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { usePastTripDetail } from '@/src/hooks/useHistory';
import { TripMap } from '@/src/components/map/TripMap';
import { CardHistoriqueAlerte } from '@/src/components/history/CardHistoriqueAlerte';
import { Tag, TagVariant } from '@/src/components/ui/Tag';
import {
  formatDate,
  formatTime,
  formatDuration,
  formatCoordinates,
} from '@/src/utils/formatters';
import { ALERT_TYPE } from '@/src/utils/constants';

type TripHistoryStatus = 'completed' | 'cancelled' | 'alerted';

function mapTripStatus(status: string | null): TripHistoryStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'alerted' || status === 'alert' || status === 'timeout') return 'alerted';
  return 'completed';
}

const STATUS_CONFIG: Record<TripHistoryStatus, { label: string; variant: TagVariant }> = {
  completed: { label: 'Terminé', variant: 'valid' },
  cancelled: { label: 'Annulé', variant: 'neutral' },
  alerted: { label: 'Alerte', variant: 'problem' },
};

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

type AlertHistoryStatus = 'active' | 'resolved' | 'expired' | 'deleted';

function mapAlertDisplayStatus(alert: { resolved_at: string | null; status: string | null }): AlertHistoryStatus {
  if (alert.resolved_at) return 'resolved';
  if (alert.status === 'triggered' || alert.status === 'acknowledged') return 'active';
  return 'expired';
}

interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={scaledIcon(18)} color={colors.primary[300]} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trip, locations, alerts, isLoading, error } = usePastTripDetail(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger le trajet</Text>
      </View>
    );
  }

  const statusKey = mapTripStatus(trip.status);
  const statusConfig = STATUS_CONFIG[statusKey];

  const departure = trip.departure_lat != null && trip.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const arrival = trip.arrival_lat != null && trip.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  const routeCoordinates = locations.map((loc) => ({
    latitude: loc.lat,
    longitude: loc.lng,
  }));

  const actualDuration = (() => {
    if (trip.started_at && (trip.completed_at ?? trip.cancelled_at)) {
      const start = new Date(trip.started_at).getTime();
      const end = new Date((trip.completed_at ?? trip.cancelled_at)!).getTime();
      return Math.max(Math.round((end - start) / 60000), 1);
    }
    return trip.estimated_duration_minutes;
  })();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing[6] }}
    >
      {/* Map */}
      {(departure || arrival) && (
        <TripMap
          departure={departure}
          arrival={arrival}
          routeCoordinates={routeCoordinates.length >= 2 ? routeCoordinates : undefined}
          style={styles.map}
        />
      )}

      {/* Status tag */}
      <View style={styles.statusRow}>
        <Tag label={statusConfig.label} variant={statusConfig.variant} />
        {trip.started_at && (
          <Text style={styles.dateText}>{formatDate(trip.started_at)}</Text>
        )}
      </View>

      {/* Destination */}
      <Text style={styles.destination}>
        {trip.arrival_address ?? 'Destination inconnue'}
      </Text>
      {trip.departure_address && (
        <Text style={styles.departureAddress}>
          Depuis {trip.departure_address}
        </Text>
      )}

      {/* Trip info */}
      <View style={styles.infoCard}>
        {trip.started_at && (
          <InfoRow
            icon="time-outline"
            label="Départ"
            value={formatTime(trip.started_at)}
          />
        )}
        {(trip.completed_at ?? trip.cancelled_at) && (
          <InfoRow
            icon="flag-outline"
            label={trip.status === 'cancelled' ? 'Annulé à' : 'Arrivée'}
            value={formatTime((trip.completed_at ?? trip.cancelled_at)!)}
          />
        )}
        {actualDuration != null && (
          <InfoRow
            icon="hourglass-outline"
            label="Durée"
            value={formatDuration(actualDuration)}
          />
        )}
        {trip.estimated_duration_minutes != null && (
          <InfoRow
            icon="timer-outline"
            label="Durée estimée"
            value={formatDuration(trip.estimated_duration_minutes)}
          />
        )}
        {trip.transport_mode && (
          <InfoRow
            icon="car-outline"
            label="Transport"
            value={trip.transport_mode}
          />
        )}
      </View>

      {/* Coordinates */}
      {(departure || arrival) && (
        <View style={styles.infoCard}>
          {departure && (
            <InfoRow
              icon="location-outline"
              label="Coord. départ"
              value={formatCoordinates(departure.lat, departure.lng)}
            />
          )}
          {arrival && (
            <InfoRow
              icon="navigate-outline"
              label="Coord. arrivée"
              value={formatCoordinates(arrival.lat, arrival.lng)}
            />
          )}
        </View>
      )}

      {/* Alerts section */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            Alertes ({alerts.length})
          </Text>
          {alerts.map((alert) => (
            <CardHistoriqueAlerte
              key={alert.id}
              emoji={ALERT_TYPE_EMOJI[alert.type] ?? '🚨'}
              title={ALERT_TYPE_LABEL[alert.type] ?? 'Alerte'}
              description={alert.reason ?? 'Aucune raison spécifiée'}
              date={alert.triggered_at ? formatDate(alert.triggered_at) : '--'}
              status={mapAlertDisplayStatus(alert)}
              onPress={() => router.push({ pathname: '/(history)/alert/[id]', params: { id: alert.id } })}
              style={styles.alertCard}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[950],
  },
  errorText: {
    ...typography.body,
    color: colors.error[400],
  },
  map: {
    height: ms(200, 0.5),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  dateText: {
    ...typography.caption,
    color: colors.gray[400],
  },
  destination: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
  },
  departureAddress: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginHorizontal: spacing[4],
    marginTop: spacing[1],
  },
  infoCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[4],
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoLabel: {
    ...typography.caption,
    color: colors.gray[400],
    flex: 1,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '500',
  },
  alertsSection: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  alertCard: {
    marginBottom: spacing[2],
  },
});
