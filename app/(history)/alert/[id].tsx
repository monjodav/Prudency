import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Loader } from '@/src/components/ui/Loader';
import { scaledIcon, ms } from '@/src/utils/scaling';
import { usePastAlertDetail } from '@/src/hooks/useHistory';
import { TagAlerte } from '@/src/components/alert/TagAlerte';
import {
  formatDateTime,
  formatCoordinates,
  formatBattery,
} from '@/src/utils/formatters';
import { ALERT_TYPE } from '@/src/utils/constants';

type AlertHistoryStatus = 'active' | 'resolved' | 'expired' | 'deleted';

function mapAlertDisplayStatus(alert: { resolved_at: string | null; status: string | null }): AlertHistoryStatus {
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
  [ALERT_TYPE.INACTIVITY]: 'Inactivité détectée',
  [ALERT_TYPE.DEVIATION]: 'Déviation de trajet',
};

const ALERT_STATUS_LABEL: Record<string, string> = {
  triggered: 'Déclenchée',
  acknowledged: 'Prise en charge',
  resolved: 'Résolue',
  false_alarm: 'Fausse alerte',
};

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

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { alert, isLoading, error } = usePastAlertDetail(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Loader size="lg" />
      </View>
    );
  }

  if (error || !alert) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger l'alerte</Text>
      </View>
    );
  }

  const displayStatus = mapAlertDisplayStatus(alert);
  const emoji = ALERT_TYPE_EMOJI[alert.type] ?? '🚨';
  const typeLabel = ALERT_TYPE_LABEL[alert.type] ?? 'Alerte';
  const statusLabel = ALERT_STATUS_LABEL[alert.status ?? ''] ?? alert.status ?? 'Inconnu';

  const duration = (() => {
    if (alert.triggered_at && alert.resolved_at) {
      const start = new Date(alert.triggered_at).getTime();
      const end = new Date(alert.resolved_at).getTime();
      const minutes = Math.round((end - start) / 60000);
      if (minutes < 1) return 'Moins d\'une minute';
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      return remaining > 0 ? `${hours}h${remaining.toString().padStart(2, '0')}` : `${hours}h`;
    }
    return null;
  })();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing[6] }}
    >
      {/* Header with emoji and type */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
        <TagAlerte variant={displayStatus} />
      </View>

      {/* Reason */}
      {alert.reason && (
        <View style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>Raison</Text>
          <Text style={styles.reasonText}>{alert.reason}</Text>
        </View>
      )}

      {/* Timeline info */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Chronologie</Text>
        {alert.triggered_at && (
          <InfoRow
            icon="alert-circle-outline"
            label="Déclenchée"
            value={formatDateTime(alert.triggered_at)}
          />
        )}
        {alert.acknowledged_at && (
          <InfoRow
            icon="checkmark-circle-outline"
            label="Prise en charge"
            value={formatDateTime(alert.acknowledged_at)}
          />
        )}
        {alert.resolved_at && (
          <InfoRow
            icon="shield-checkmark-outline"
            label="Résolue"
            value={formatDateTime(alert.resolved_at)}
          />
        )}
        {duration && (
          <InfoRow
            icon="hourglass-outline"
            label="Durée de l'alerte"
            value={duration}
          />
        )}
        <InfoRow
          icon="information-circle-outline"
          label="Statut final"
          value={statusLabel}
        />
      </View>

      {/* Technical info */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informations</Text>
        {alert.triggered_lat != null && alert.triggered_lng != null && (
          <InfoRow
            icon="location-outline"
            label="Position"
            value={formatCoordinates(alert.triggered_lat, alert.triggered_lng)}
          />
        )}
        {alert.battery_level != null && (
          <InfoRow
            icon="battery-half-outline"
            label="Batterie"
            value={formatBattery(alert.battery_level)}
          />
        )}
      </View>

      {/* Link to trip */}
      {alert.trip_id && (
        <Pressable
          style={({ pressed }) => [
            styles.tripLink,
            pressed && styles.tripLinkPressed,
          ]}
          onPress={() => router.push({ pathname: '/(history)/trip/[id]', params: { id: alert.trip_id } })}
        >
          <Ionicons name="walk-outline" size={scaledIcon(20)} color={colors.primary[300]} />
          <Text style={styles.tripLinkText}>Voir le trajet associé</Text>
          <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.gray[600]} />
        </Pressable>
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
  header: {
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  emoji: {
    fontSize: ms(48, 0.5),
  },
  typeLabel: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  reasonCard: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[4],
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[1],
  },
  reasonText: {
    ...typography.body,
    color: colors.white,
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
  cardTitle: {
    ...typography.bodySmall,
    color: colors.primary[300],
    fontWeight: '600',
    marginBottom: spacing[1],
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
    flexShrink: 1,
    textAlign: 'right',
  },
  tripLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[4],
    gap: spacing[3],
  },
  tripLinkPressed: {
    opacity: 0.7,
  },
  tripLinkText: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
});
