import React, { useState, useEffect } from 'react';
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
import { ms, scaledSpacing, scaledIcon } from '@/src/utils/scaling';

export default function AlertReceivedScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const router = useRouter();
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const [alertData] = useState({
    personName: 'Marie Dupont',
    personPhone: '+33612345678',
    type: 'manual' as 'manual' | 'timeout',
    triggeredAt: new Date().toISOString(),
    reason: 'Je me sens en danger',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: 'Proche de Place de la Republique, Paris',
    },
    batteryLevel: 45,
  });

  useEffect(() => {
    // Vibrate on alert
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    return () => {
      Vibration.cancel();
    };
  }, []);

  const handleCall = () => {
    Linking.openURL(`tel:${alertData.personPhone}`);
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:112');
  };

  const handleOpenMaps = () => {
    const url = `https://maps.google.com/?q=${alertData.location.lat},${alertData.location.lng}`;
    Linking.openURL(url);
  };

  const handleAcknowledge = async () => {
    setIsAcknowledged(true);
    // Placeholder: notify the system that we're handling this
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <FontAwesome name="exclamation-triangle" size={scaledIcon(48)} color={colors.white} />
        </View>
        <Text style={styles.alertTitle}>ALERTE</Text>
        <Text style={styles.alertSubtitle}>
          {alertData.personName} a besoin d'aide
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FontAwesome name="clock-o" size={scaledIcon(18)} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              Declenchee a {formatTime(alertData.triggeredAt)}
            </Text>
          </View>

          {alertData.reason && (
            <View style={styles.infoRow}>
              <FontAwesome name="comment" size={scaledIcon(18)} color={colors.gray[500]} />
              <Text style={styles.infoText}>{alertData.reason}</Text>
            </View>
          )}

          <Pressable style={styles.locationRow} onPress={handleOpenMaps}>
            <FontAwesome name="map-marker" size={scaledIcon(18)} color={colors.primary[500]} />
            <Text style={styles.locationText}>{alertData.location.address}</Text>
            <FontAwesome name="external-link" size={scaledIcon(14)} color={colors.primary[500]} />
          </Pressable>

          <View style={styles.infoRow}>
            <FontAwesome
              name={alertData.batteryLevel > 20 ? 'battery-three-quarters' : 'battery-quarter'}
              size={scaledIcon(18)}
              color={alertData.batteryLevel > 20 ? colors.success[500] : colors.error[500]}
            />
            <Text style={styles.infoText}>
              Batterie : {alertData.batteryLevel}%
            </Text>
          </View>
        </View>

        {!isAcknowledged ? (
          <Button
            title="Je prends en charge"
            onPress={handleAcknowledge}
            fullWidth
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
            <Text style={styles.actionTitle}>Appeler {alertData.personName.split(' ')[0]}</Text>
            <Text style={styles.actionSubtitle}>Verifier son etat</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleOpenMaps}>
            <View style={[styles.actionIcon, { backgroundColor: colors.info[50] }]}>
              <FontAwesome name="map" size={scaledIcon(24)} color={colors.info[500]} />
            </View>
            <Text style={styles.actionTitle}>Voir la position</Text>
            <Text style={styles.actionSubtitle}>Ouvrir dans Maps</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleCallEmergency}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error[50] }]}>
              <FontAwesome name="ambulance" size={scaledIcon(24)} color={colors.error[500]} />
            </View>
            <Text style={styles.actionTitle}>Appeler les secours</Text>
            <Text style={styles.actionSubtitle}>112</Text>
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
