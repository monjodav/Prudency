import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { scaledIcon, ms } from '@/src/utils/scaling';

export default function CompleteTripScreen() {
  const router = useRouter();
  const { trip } = useActiveTrip();
  const { completeTrip, isCompleting } = useTrip();
  const { stopTracking } = useLocation();
  const { reset: resetTripStore } = useTripStore();

  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmArrival = async () => {
    if (!trip) return;
    setError(null);
    try {
      await stopTracking();
      await completeTrip(trip.id);
      setIsCompleted(true);
    } catch {
      setError('Erreur lors de la confirmation. Veuillez reessayer.');
    }
  };

  const handleGoHome = () => {
    resetTripStore();
    router.replace('/(tabs)');
  };

  const handleReportIssue = () => {
    resetTripStore();
    router.replace('/(tabs)');
  };

  if (isCompleted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={scaledIcon(80)} color={colors.success[500]} />
          </View>

          <Text style={styles.title}>Bien arrivee !</Text>
          <Text style={styles.subtitle}>
            Votre trajet a ete enregistre avec succes. Vos contacts ont ete
            prevenus de votre arrivee.
          </Text>

          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resume du trajet</Text>

            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={scaledIcon(16)} color={colors.gray[500]} />
              <Text style={styles.summaryLabel}>Duree</Text>
              <Text style={styles.summaryValue}>
                {trip?.started_at
                  ? `${Math.round(
                      (Date.now() - new Date(trip.started_at).getTime()) /
                        (1000 * 60)
                    )} min`
                  : '--'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="location-outline" size={scaledIcon(16)} color={colors.gray[500]} />
              <Text style={styles.summaryLabel}>Destination</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {trip?.arrival_address ?? '--'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.actions}>
          <Button
            title="Retour a l'accueil"
            onPress={handleGoHome}
            fullWidth
            size="lg"
            icon={<Ionicons name="home-outline" size={scaledIcon(20)} color={colors.white} />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={scaledIcon(64)} color={colors.primary[500]} />
        </View>

        <Text style={styles.title}>Confirmer votre arrivee</Text>
        <Text style={styles.subtitle}>
          Confirmez que vous etes bien arrivee a destination en securite.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={scaledIcon(16)} color={colors.error[600]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Je suis bien arrivee"
          onPress={handleConfirmArrival}
          loading={isCompleting}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle" size={scaledIcon(20)} color={colors.white} />}
        />
        <Pressable onPress={handleReportIssue} style={styles.reportButton}>
          <Ionicons name="warning-outline" size={scaledIcon(18)} color={colors.error[500]} />
          <Text style={styles.reportText}>Signaler un probleme</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  title: {
    ...typography.h1,
    color: colors.gray[900],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[600],
  },
  summaryCard: {
    width: '100%',
  },
  summaryTitle: {
    ...typography.label,
    color: colors.gray[500],
    textTransform: 'uppercase',
    marginBottom: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing[2],
  },
  summaryLabel: {
    ...typography.body,
    color: colors.gray[700],
    flex: 1,
  },
  summaryValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
    maxWidth: ms(150, 0.5),
  },
  actions: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    alignItems: 'center',
    gap: spacing[4],
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  reportText: {
    ...typography.bodySmall,
    color: colors.error[500],
  },
});
