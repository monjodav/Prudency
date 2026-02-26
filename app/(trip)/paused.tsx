import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { TripMap } from '@/src/components/map/TripMap';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { fetchDirections } from '@/src/services/directionsService';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';

export default function PausedTripScreen() {
  const router = useRouter();
  const { trip, remainingMinutes } = useActiveTrip();
  const { cancelTrip, isCancelling } = useTrip();
  const { startTracking } = useLocation();
  const { reset: resetTripStore } = useTripStore();

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [route, setRoute] = useState<DecodedRoute | null>(null);

  const departure = trip?.departure_lat != null && trip?.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const arrival = trip?.arrival_lat != null && trip?.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  useEffect(() => {
    if (departure && arrival && !route) {
      fetchDirections(departure, arrival).then((r) => {
        if (r) setRoute(r);
      });
    }
  }, [departure?.lat, departure?.lng, arrival?.lat, arrival?.lng]);

  const elapsedMinutes = useCallback((): number => {
    if (!trip?.started_at) return 0;
    const start = new Date(trip.started_at).getTime();
    return Math.max(0, Math.round((Date.now() - start) / (1000 * 60)));
  }, [trip?.started_at]);

  const totalMinutes = trip?.estimated_duration_minutes ?? 30;
  const elapsed = elapsedMinutes();
  const progress = Math.min(1, elapsed / totalMinutes);

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

  const formatMinSec = (min: number): string => {
    const m = Math.floor(min);
    return `${m}m 00s`;
  };

  return (
    <View style={styles.container}>
      <TripMap
        departure={departure}
        arrival={arrival}
        routeCoordinates={route?.polyline}
        style={styles.fullMap}
      />

      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable style={styles.cardHeader} onPress={() => setExpanded(!expanded)}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="walk" size={scaledIcon(20)} color={colors.white} />
              <View>
                <Text style={styles.cardTitle}>Trajet en pause</Text>
                <Text style={styles.cardSubtitle}>
                  Reprise dans {remainingMinutes} min
                </Text>
              </View>
            </View>
            <Ionicons
              name={expanded ? 'eye-outline' : 'eye-off-outline'}
              size={scaledIcon(20)}
              color={colors.white}
            />
          </Pressable>

          {expanded && (
            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destination</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {trip?.arrival_address ?? 'Non definie'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contacts</Text>
                <Text style={styles.detailValue}>-</Text>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Temps écoulé</Text>
                  <Text style={styles.timeValue}>{formatMinSec(elapsed)}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>Temps restant</Text>
                  <Text style={styles.timeValue}>{formatMinSec(remainingMinutes)}</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>

              <Button
                title="Reprendre le trajet"
                onPress={handleResume}
                loading={isResuming}
                fullWidth
                size="lg"
                icon={<Ionicons name="play" size={scaledIcon(18)} color={colors.white} />}
              />

              <Pressable
                style={styles.cancelLink}
                onPress={() => setShowCancelConfirmation(true)}
              >
                <Text style={styles.cancelLinkText}>Annuler le trajet</Text>
              </Pressable>
            </View>
          )}
        </View>
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
    backgroundColor: colors.primary[950],
  },
  fullMap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },
  overlay: {
    position: 'absolute',
    top: ms(60, 0.5),
    left: spacing[4],
    right: spacing[4],
  },
  card: {
    backgroundColor: 'rgba(90, 53, 107, 0.92)',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  cardTitle: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.success[400],
  },
  cardBody: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.gray[300],
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
    maxWidth: '60%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    ...typography.caption,
    color: colors.gray[300],
    marginBottom: spacing[1],
  },
  timeValue: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  progressBar: {
    height: ms(4, 0.3),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success[400],
    borderRadius: borderRadius.full,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  cancelLinkText: {
    ...typography.bodySmall,
    color: colors.error[400],
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
