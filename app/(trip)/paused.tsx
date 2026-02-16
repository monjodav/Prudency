import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

export default function PausedTripScreen() {
  const router = useRouter();
  const [pausedDuration, setPausedDuration] = useState(0);
  const [tripData] = useState({
    destination: 'Maison',
    remainingMinutes: 15,
    pausedAt: new Date(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPausedDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResume = () => {
    router.replace('/(trip)/active');
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler le trajet',
      'Etes-vous sur de vouloir annuler ce trajet ?',
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome name="pause" size={48} color={colors.warning[500]} />
        </View>
        <Text style={styles.title}>Trajet en pause</Text>
        <Text style={styles.pausedTime}>
          Pause depuis {formatDuration(pausedDuration)}
        </Text>
      </View>

      <View style={styles.warningCard}>
        <FontAwesome name="exclamation-triangle" size={20} color={colors.warning[600]} />
        <Text style={styles.warningText}>
          Vos contacts de confiance ne recoivent pas de mises a jour pendant la pause.
          Le trajet reprendra automatiquement si vous vous deplacez.
        </Text>
      </View>

      <View style={styles.tripInfo}>
        <View style={styles.infoRow}>
          <FontAwesome name="flag-checkered" size={16} color={colors.gray[500]} />
          <Text style={styles.infoLabel}>Destination :</Text>
          <Text style={styles.infoValue}>{tripData.destination}</Text>
        </View>
        <View style={styles.infoRow}>
          <FontAwesome name="hourglass-half" size={16} color={colors.gray[500]} />
          <Text style={styles.infoLabel}>Temps restant :</Text>
          <Text style={styles.infoValue}>{tripData.remainingMinutes} min</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Reprendre le trajet"
          onPress={handleResume}
          fullWidth
          style={styles.resumeButton}
        />
        <Button
          title="Annuler le trajet"
          variant="outline"
          onPress={handleCancel}
          fullWidth
        />
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
    backgroundColor: colors.warning[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  pausedTime: {
    ...typography.body,
    color: colors.warning[600],
    fontWeight: '600',
    marginTop: spacing[2],
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.warning[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning[800],
    flex: 1,
  },
  tripInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  infoLabel: {
    ...typography.body,
    color: colors.gray[600],
  },
  infoValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  actions: {
    gap: spacing[3],
    marginTop: 'auto',
  },
  resumeButton: {
    backgroundColor: colors.warning[500],
  },
});
