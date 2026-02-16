import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Animated,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { useAlert } from '@/src/hooks/useAlert';
import { useContacts } from '@/src/hooks/useContacts';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTripStore } from '@/src/stores/tripStore';
import { scaledFontSize, scaledIcon, scaledRadius, ms } from '@/src/utils/scaling';

const ALERT_COUNTDOWN_SECONDS = 30;

export default function AlertActiveScreen() {
  const router = useRouter();
  const { resolveAlertByTrip, isResolvingByTrip } = useAlert();
  const { contacts } = useContacts();
  const { trip } = useActiveTrip();
  const { reset: resetTripStore } = useTripStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [alertDuration, setAlertDuration] = useState(0);
  // Alert is already triggered when navigating to this screen
  const alertSent = true;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const vibratePattern = setInterval(() => {
      Vibration.vibrate([0, 200, 100, 200]);
    }, 5000);

    return () => {
      clearInterval(vibratePattern);
      Vibration.cancel();
    };
  }, [pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlertDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSeconds = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleCancelAlert = async () => {
    try {
      if (trip) {
        await resolveAlertByTrip({ tripId: trip.id, status: 'false_alarm' });
      }
      resetTripStore();
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  };

  const handleCall112 = () => {
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.alertIconContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons name="warning" size={scaledIcon(64)} color={colors.white} />
        </Animated.View>
        <Text style={styles.title}>ALERTE ACTIVE</Text>
        <Text style={styles.duration}>
          Depuis {formatSeconds(alertDuration)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Contacts notifies</Text>
            <Text style={styles.statusCount}>
              {contacts.length}/{contacts.length}
            </Text>

            <View style={styles.contactsList}>
              {contacts.map((contact) => (
                <View key={contact.id} style={styles.contactRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={scaledIcon(18)}
                    color={colors.success[500]}
                  />
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactStatus}>Notifie</Text>
                </View>
              ))}
              {contacts.length === 0 && (
                <Text style={styles.noContactsText}>
                  Aucun contact de confiance configure.
                </Text>
              )}
            </View>
          </View>

        <View style={styles.infoCard}>
          <Ionicons name="location" size={scaledIcon(18)} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            Votre position est partagee en temps reel avec vos contacts
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>En cas d'urgence</Text>
          <Pressable style={styles.emergencyButton} onPress={handleCall112}>
            <Ionicons name="call" size={scaledIcon(20)} color={colors.white} />
            <Text style={styles.emergencyButtonText}>Appeler le 112</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Tout va bien"
          variant="outline"
          onPress={handleCancelAlert}
          loading={isResolvingByTrip}
          fullWidth
          icon={<Ionicons name="shield-checkmark-outline" size={scaledIcon(20)} color={colors.primary[50]} />}
        />
        <Text style={styles.cancelHint}>
          Annulez uniquement si vous etes en securite
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.error[500],
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  alertIconContainer: {
    width: ms(120, 0.5),
    height: ms(120, 0.5),
    borderRadius: ms(120, 0.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h1,
    color: colors.white,
    letterSpacing: scaledFontSize(2),
  },
  countdown: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing[2],
    fontWeight: '600',
  },
  duration: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing[2],
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[6],
  },
  countdownCard: {
    alignItems: 'center',
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    marginBottom: spacing[4],
  },
  countdownBig: {
    fontSize: scaledFontSize(64),
    fontWeight: '700',
    color: colors.error[500],
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    ...typography.body,
    color: colors.error[700],
    textAlign: 'center',
    marginTop: spacing[2],
  },
  statusCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  statusTitle: {
    ...typography.label,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  statusCount: {
    ...typography.h2,
    color: colors.success[500],
    marginVertical: spacing[2],
  },
  contactsList: {
    gap: spacing[3],
    marginTop: spacing[2],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  contactName: {
    ...typography.body,
    color: colors.gray[700],
    flex: 1,
  },
  contactStatus: {
    ...typography.caption,
    color: colors.success[600],
    fontWeight: '600',
  },
  noContactsText: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.primary[700],
    flex: 1,
  },
  emergencyCard: {
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  emergencyTitle: {
    ...typography.label,
    color: colors.error[700],
    marginBottom: spacing[3],
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    backgroundColor: colors.error[500],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  emergencyButtonText: {
    ...typography.button,
    color: colors.white,
  },
  footer: {
    backgroundColor: colors.white,
    padding: spacing[6],
    paddingTop: 0,
  },
  cancelHint: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
