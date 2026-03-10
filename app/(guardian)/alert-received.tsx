import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Linking,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { useGuardianAlertDetail, useAcknowledgeAlert } from '@/src/hooks/useGuardianAlert';
import { useRealtimeLocation } from '@/src/hooks/useRealtimeLocation';
import { Loader } from '@/src/components/ui/Loader';
import { ms, scaledSpacing, scaledIcon } from '@/src/utils/scaling';

export default function AlertReceivedScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGuardianAlertDetail(alertId ?? null);
  const { acknowledge, isAcknowledging } = useAcknowledgeAlert();

  const isAcknowledged = data?.alert.status === 'acknowledged' || data?.alert.status === 'resolved';

  const { location: realtimeLocation } = useRealtimeLocation({
    tripId: data?.trip.id ?? null,
    enabled: !!data?.trip.id,
  });

  const currentLat = realtimeLocation?.lat ?? data?.alert.triggered_lat;
  const currentLng = realtimeLocation?.lng ?? data?.alert.triggered_lng;
  const currentBattery = realtimeLocation?.batteryLevel ?? data?.alert.battery_level;

  useEffect(() => {
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    return () => {
      Vibration.cancel();
    };
  }, []);

  const handleCall = () => {
    if (data?.person.phone) {
      Linking.openURL(`tel:${data.person.phone}`);
    }
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:112');
  };

  const handleOpenMaps = () => {
    if (currentLat != null && currentLng != null) {
      Linking.openURL(`https://maps.google.com/?q=${currentLat},${currentLng}`);
    }
  };

  const handleAcknowledge = async () => {
    if (!alertId) return;
    await acknowledge(alertId);
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertTypeLabel = (type: string): string => {
    switch (type) {
      case 'manual':
        return 'Alerte manuelle';
      case 'timeout':
        return 'Non-arrivee a destination';
      case 'inactivity':
        return 'Inactivite detectee';
      case 'deviation':
        return 'Deviation de trajet';
      default:
        return 'Alerte';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <Loader size="lg" color={colors.white} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <FontAwesome name="exclamation-circle" size={scaledIcon(48)} color={colors.white} />
        <Text style={styles.errorText}>Impossible de charger l'alerte</Text>
        <Button
          title="Fermer"
          variant="outline"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  const { alert, person } = data;
  const firstName = person.firstName ?? person.name.split(' ')[0];

  return (
    <View style={styles.container}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <FontAwesome name="exclamation-triangle" size={scaledIcon(48)} color={colors.white} />
        </View>
        <Text style={styles.alertTitle}>ALERTE</Text>
        <Text style={styles.alertSubtitle}>
          {person.name} a besoin d'aide
        </Text>
        <Text style={styles.alertType}>{getAlertTypeLabel(alert.type)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FontAwesome name="clock-o" size={scaledIcon(18)} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              Declenchee a {formatTime(alert.triggered_at)}
            </Text>
          </View>

          {alert.reason && (
            <View style={styles.infoRow}>
              <FontAwesome name="comment" size={scaledIcon(18)} color={colors.gray[500]} />
              <Text style={styles.infoText}>{alert.reason}</Text>
            </View>
          )}

          {currentLat != null && currentLng != null && (
            <Pressable style={styles.locationRow} onPress={handleOpenMaps}>
              <FontAwesome name="map-marker" size={scaledIcon(18)} color={colors.primary[500]} />
              <Text style={styles.locationText}>
                Voir la position ({currentLat.toFixed(4)}, {currentLng.toFixed(4)})
              </Text>
              <FontAwesome name="external-link" size={scaledIcon(14)} color={colors.primary[500]} />
            </Pressable>
          )}

          {currentBattery != null && (
            <View style={styles.infoRow}>
              <FontAwesome
                name={currentBattery > 20 ? 'battery-three-quarters' : 'battery-quarter'}
                size={scaledIcon(18)}
                color={currentBattery > 20 ? colors.success[500] : colors.error[500]}
              />
              <Text style={styles.infoText}>
                Batterie : {currentBattery}%
              </Text>
            </View>
          )}

          {realtimeLocation && (
            <View style={styles.liveBadgeRow}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>EN DIRECT</Text>
              </View>
              <Text style={styles.liveTimestamp}>
                Mis a jour a {formatTime(realtimeLocation.recordedAt)}
              </Text>
            </View>
          )}
        </View>

        {!isAcknowledged ? (
          <Button
            title={isAcknowledging ? 'Prise en charge...' : 'Je prends en charge'}
            onPress={handleAcknowledge}
            fullWidth
            disabled={isAcknowledging}
            style={styles.acknowledgeButton}
          />
        ) : (
          <View style={styles.acknowledgedBanner}>
            <FontAwesome name="check-circle" size={scaledIcon(20)} color={colors.success[600]} />
            <Text style={styles.acknowledgedText}>
              Vous avez pris en charge cette alerte
            </Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionCard} onPress={handleCall}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary[50] }]}>
              <FontAwesome name="phone" size={scaledIcon(24)} color={colors.primary[500]} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Appeler {firstName}</Text>
              <Text style={styles.actionSubtitle}>Verifier son etat</Text>
            </View>
          </Pressable>

          {currentLat != null && currentLng != null && (
            <Pressable style={styles.actionCard} onPress={handleOpenMaps}>
              <View style={[styles.actionIcon, { backgroundColor: colors.info[50] }]}>
                <FontAwesome name="map" size={scaledIcon(24)} color={colors.info[500]} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Voir la position</Text>
                <Text style={styles.actionSubtitle}>Ouvrir dans Maps</Text>
              </View>
            </Pressable>
          )}

          <Pressable style={styles.actionCard} onPress={handleCallEmergency}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error[50] }]}>
              <FontAwesome name="ambulance" size={scaledIcon(24)} color={colors.error[500]} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Appeler les secours</Text>
              <Text style={styles.actionSubtitle}>112</Text>
            </View>
          </Pressable>
        </View>

        <Button
          title="Fermer"
          variant="outline"
          onPress={() => router.back()}
          fullWidth
          style={styles.closeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.error[500],
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  errorText: {
    ...typography.body,
    color: colors.white,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  errorButton: {
    borderColor: colors.white,
  },
  alertHeader: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  alertIconContainer: {
    width: ms(96, 0.5),
    height: ms(96, 0.5),
    borderRadius: ms(96, 0.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  alertTitle: {
    ...typography.h1,
    color: colors.white,
    letterSpacing: scaledSpacing(4),
  },
  alertSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing[2],
  },
  alertType: {
    ...typography.bodySmall,
    color: colors.white,
    opacity: 0.7,
    marginTop: spacing[1],
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[6],
  },
  infoCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  infoText: {
    ...typography.body,
    color: colors.gray[700],
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginHorizontal: -spacing[1],
  },
  locationText: {
    ...typography.body,
    color: colors.primary[700],
    flex: 1,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.error[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: ms(8, 0.5),
    height: ms(8, 0.5),
    borderRadius: ms(8, 0.5) / 2,
    backgroundColor: colors.error[500],
  },
  liveBadgeText: {
    ...typography.caption,
    color: colors.error[600],
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveTimestamp: {
    ...typography.caption,
    color: colors.gray[500],
  },
  acknowledgeButton: {
    marginBottom: spacing[4],
  },
  acknowledgedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.success[50],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  acknowledgedText: {
    ...typography.body,
    color: colors.success[700],
    fontWeight: '600',
  },
  actionsContainer: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    gap: spacing[4],
  },
  actionIcon: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[900],
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: colors.gray[500],
  },
  closeButton: {
    marginTop: 'auto',
  },
});
