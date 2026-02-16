import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

export default function ScheduledTripScreen() {
  const router = useRouter();
  const [tripData] = useState({
    destination: 'Maison',
    address: '12 Rue de la Paix, Paris',
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
    estimatedDuration: 25,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilStart = () => {
    const diff = tripData.scheduledAt.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Maintenant';
    if (minutes === 1) return 'Dans 1 minute';
    return `Dans ${minutes} minutes`;
  };

  const handleStartNow = () => {
    router.push('/(trip)/active');
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler le trajet',
      'Etes-vous sur de vouloir annuler ce trajet programme ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const handleModify = () => {
    router.push('/(trip)/create');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome name="clock-o" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.title}>Trajet programme</Text>
        <Text style={styles.timeUntil}>{getTimeUntilStart()}</Text>
      </View>

      <View style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <FontAwesome name="flag-checkered" size={18} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Destination</Text>
            <Text style={styles.tripValue}>{tripData.destination}</Text>
            <Text style={styles.tripAddress}>{tripData.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <FontAwesome name="calendar" size={18} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Depart prevu</Text>
            <Text style={styles.tripValue}>{formatTime(tripData.scheduledAt)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tripRow}>
          <View style={styles.tripIcon}>
            <FontAwesome name="hourglass-half" size={18} color={colors.primary[500]} />
          </View>
          <View style={styles.tripInfo}>
            <Text style={styles.tripLabel}>Duree estimee</Text>
            <Text style={styles.tripValue}>{tripData.estimatedDuration} minutes</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Demarrer maintenant"
          onPress={handleStartNow}
          fullWidth
        />
        <Button
          title="Modifier"
          variant="outline"
          onPress={handleModify}
          fullWidth
        />
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Annuler le trajet</Text>
        </Pressable>
      </View>

      <View style={styles.noticeContainer}>
        <FontAwesome name="info-circle" size={16} color={colors.info[500]} />
        <Text style={styles.noticeText}>
          Vous recevrez une notification quand il sera l'heure de partir
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  timeUntil: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
    marginTop: spacing[2],
  },
  tripCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  tripInfo: {
    flex: 1,
  },
  tripLabel: {
    ...typography.caption,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  tripValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
    marginTop: spacing[1],
  },
  tripAddress: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing[4],
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  cancelText: {
    ...typography.body,
    color: colors.error[500],
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.info[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  noticeText: {
    ...typography.bodySmall,
    color: colors.info[700],
    flex: 1,
  },
});
