import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

export default function AlertActiveScreen() {
  const router = useRouter();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [alertDuration, setAlertDuration] = useState(0);
  const [notifiedContacts] = useState([
    { id: '1', name: 'Marie Dupont', notified: true },
    { id: '2', name: 'Sophie Martin', notified: true },
    { id: '3', name: 'Julie Bernard', notified: false },
  ]);

  useEffect(() => {
    // Pulse animation
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

    // Vibrate pattern
    const vibratePattern = setInterval(() => {
      Vibration.vibrate([0, 200, 100, 200]);
    }, 5000);

    // Duration counter
    const durationInterval = setInterval(() => {
      setAlertDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(vibratePattern);
      clearInterval(durationInterval);
      Vibration.cancel();
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancelAlert = () => {
    // Placeholder: cancel alert and return to normal trip or home
    router.replace('/(tabs)');
  };

  const notifiedCount = notifiedContacts.filter((c) => c.notified).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.alertIconContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <FontAwesome name="exclamation-triangle" size={64} color={colors.white} />
        </Animated.View>
        <Text style={styles.title}>ALERTE ACTIVE</Text>
        <Text style={styles.duration}>Depuis {formatDuration(alertDuration)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Contacts notifies</Text>
          <Text style={styles.statusCount}>
            {notifiedCount}/{notifiedContacts.length}
          </Text>

          <View style={styles.contactsList}>
            {notifiedContacts.map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <FontAwesome
                  name={contact.notified ? 'check-circle' : 'spinner'}
                  size={16}
                  color={contact.notified ? colors.success[500] : colors.warning[500]}
                />
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactStatus}>
                  {contact.notified ? 'Notifie' : 'En cours...'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <FontAwesome name="map-marker" size={18} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            Votre position est partagee en temps reel avec vos contacts
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>En cas d'urgence</Text>
          <Pressable style={styles.emergencyButton}>
            <FontAwesome name="phone" size={20} color={colors.white} />
            <Text style={styles.emergencyButtonText}>Appeler le 112</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Annuler l'alerte"
          variant="outline"
          onPress={handleCancelAlert}
          fullWidth
          style={styles.cancelButton}
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h1,
    color: colors.white,
    letterSpacing: 2,
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
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[6],
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
    color: colors.gray[500],
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
  cancelButton: {
    borderColor: colors.gray[300],
  },
  cancelHint: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
