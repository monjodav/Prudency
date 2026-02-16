import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { scaledIcon, scaledRadius, ms } from '@/src/utils/scaling';

export default function PausedTripScreen() {
  const router = useRouter();
  const { trip } = useActiveTrip();
  const { cancelTrip, isCancelling } = useTrip();
  const { startTracking } = useLocation();
  const { reset: resetTripStore } = useTripStore();

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const handleResume = async () => {
    setIsResuming(true);
    try {
      await startTracking();
      router.replace('/(trip)/active');
    } catch {
      setIsResuming(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!trip) return;
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      setShowCancelConfirmation(false);
      router.replace('/(tabs)');
    } catch {
      setShowCancelConfirmation(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pauseIndicator}>
          <View style={styles.pauseIconOuter}>
            <Ionicons name="pause" size={scaledIcon(48)} color={colors.warning[600]} />
          </View>
        </View>

        <Text style={styles.title}>Trajet en pause</Text>
        <Text style={styles.subtitle}>
          Le suivi de votre position est temporairement arrete. Vos contacts ne
          recoivent plus de mises a jour.
        </Text>

        <View style={styles.warningBanner}>
          <Ionicons name="information-circle-outline" size={scaledIcon(20)} color={colors.warning[700]} />
          <Text style={styles.warningText}>
            Le compteur de temps continue meme en pause. Pensez a reprendre
            votre trajet pour eviter une alerte automatique.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Reprendre le trajet"
          onPress={handleResume}
          loading={isResuming}
          fullWidth
          size="lg"
          icon={<Ionicons name="play" size={scaledIcon(20)} color={colors.white} />}
        />
        <Button
          title="Annuler le trajet"
          variant="danger"
          onPress={() => setShowCancelConfirmation(true)}
          fullWidth
          icon={<Ionicons name="close-circle-outline" size={scaledIcon(20)} color={colors.white} />}
        />
      </View>

      <Modal
        visible={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        title="Annuler le trajet ?"
      >
        <Text style={styles.confirmText}>
          Cette action est irreversible. Vos contacts seront prevenus que le
          trajet a ete annule.
        </Text>
        <View style={styles.confirmActions}>
          <Button
            title="Non, reprendre"
            variant="outline"
            onPress={() => setShowCancelConfirmation(false)}
            style={styles.confirmButton}
          />
          <Button
            title="Oui, annuler"
            variant="danger"
            onPress={handleCancelTrip}
            loading={isCancelling}
            style={styles.confirmButton}
          />
        </View>
      </Modal>
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
  pauseIndicator: {
    marginBottom: spacing[6],
  },
  pauseIconOuter: {
    width: ms(100, 0.5),
    height: ms(100, 0.5),
    borderRadius: ms(100, 0.5) / 2,
    backgroundColor: colors.warning[50],
    borderWidth: 3,
    borderColor: colors.warning[200],
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing[6],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
    width: '100%',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning[700],
    flex: 1,
  },
  actions: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  confirmText: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[6],
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  confirmButton: {
    flex: 1,
  },
});
