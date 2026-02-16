import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

export default function CompleteTripScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome name="check-circle" size={80} color={colors.success[500]} />
        </View>

        <Text style={styles.title}>Bien arrivee !</Text>
        <Text style={styles.subtitle}>
          Votre trajet a ete enregistre avec succes.
        </Text>

        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resume du trajet</Text>

          <View style={styles.summaryRow}>
            <FontAwesome name="clock-o" size={14} color={colors.gray[500]} />
            <Text style={styles.summaryLabel}>Duree</Text>
            <Text style={styles.summaryValue}>32 min</Text>
          </View>

          <View style={styles.summaryRow}>
            <FontAwesome name="map-marker" size={14} color={colors.gray[500]} />
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>--</Text>
          </View>

          <View style={styles.summaryRow}>
            <FontAwesome name="pencil" size={14} color={colors.gray[500]} />
            <Text style={styles.summaryLabel}>Notes</Text>
            <Text style={styles.summaryValue}>0</Text>
          </View>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button
          title="Retour a l'accueil"
          onPress={handleGoHome}
          fullWidth
          size="lg"
        />
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
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing[8],
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
  },
  actions: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
});
