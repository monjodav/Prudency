import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { TripMap } from '@/src/components/map/TripMap';
import { useGuardianTripDetail } from '@/src/hooks/useGuardianAlert';
import { useRealtimeLocation } from '@/src/hooks/useRealtimeLocation';
import { Loader } from '@/src/components/ui/Loader';
import { ms, scaledIcon, scaledShadow } from '@/src/utils/scaling';

export default function TrackScreen() {
  const { tripId, personId } = useLocalSearchParams<{
    tripId?: string;
    personId?: string;
  }>();
  const router = useRouter();

  const { data, isLoading, error } = useGuardianTripDetail(tripId ?? null);

  const { location: realtimeLocation, isConnected } = useRealtimeLocation({
    tripId: data?.trip.id ?? null,
    enabled: !!data?.trip.id,
  });

  const trip = data?.trip;
  const person = data?.person;
  const alert = data?.alert;

  const currentLat = realtimeLocation?.lat ?? trip?.departure_lat ?? null;
  const currentLng = realtimeLocation?.lng ?? trip?.departure_lng ?? null;
  const currentBattery = realtimeLocation?.batteryLevel ?? alert?.battery_level ?? null;

  const handleCall = () => {
    if (person?.phone) {
      Linking.openURL(`tel:${person.phone}`);
    }
  };

  const handleMessage = () => {
    if (person?.phone) {
      Linking.openURL(`sms:${person.phone}`);
    }
  };

  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <Loader size="lg" />
      </View>
    );
  }

  if (error || !data || !trip || !person) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <FontAwesome name="exclamation-circle" size={scaledIcon(48)} color={colors.gray[400]} />
        <Text style={styles.errorText}>Impossible de charger le trajet</Text>
        <Button
          title="Fermer"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const userLocation = currentLat != null && currentLng != null
    ? { lat: currentLat, lng: currentLng }
    : null;

  const arrival = trip.arrival_lat != null && trip.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {userLocation && (
          <TripMap
            userLocation={userLocation}
            arrival={arrival ?? undefined}
          />
        )}
        {!userLocation && (
          <View style={styles.noMapContainer}>
            <FontAwesome name="map-o" size={scaledIcon(48)} color={colors.gray[300]} />
            <Text style={styles.noMapText}>Position non disponible</Text>
          </View>
        )}

        {isConnected && (
          <View style={styles.liveOverlay}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.personHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {person.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.tripStatus}>
              {alert
                ? 'Alerte en cours'
                : trip.arrival_address
                  ? `En trajet vers ${trip.arrival_address}`
                  : 'En trajet'}
            </Text>
          </View>
          {currentBattery != null && (
            <View style={styles.batteryContainer}>
              <FontAwesome
                name={currentBattery > 20 ? 'battery-three-quarters' : 'battery-quarter'}
                size={scaledIcon(16)}
                color={currentBattery > 20 ? colors.success[500] : colors.error[500]}
              />
              <Text style={styles.batteryText}>{currentBattery}%</Text>
            </View>
          )}
        </View>

        {alert && (
          <View style={styles.alertBanner}>
            <FontAwesome name="exclamation-triangle" size={scaledIcon(16)} color={colors.error[600]} />
            <Text style={styles.alertBannerText}>
              Alerte declenchee a {formatTime(alert.triggered_at)}
            </Text>
          </View>
        )}

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="clock-o" size={scaledIcon(16)} color={colors.gray[500]} />
            <Text style={styles.detailText}>
              Depart : {formatTime(trip.started_at)}
            </Text>
          </View>
          {trip.estimated_arrival_at && (
            <View style={styles.detailRow}>
              <FontAwesome name="flag-checkered" size={scaledIcon(16)} color={colors.gray[500]} />
              <Text style={styles.detailText}>
                Arrivee prevue : {formatTime(trip.estimated_arrival_at)}
              </Text>
            </View>
          )}
          {trip.arrival_address && (
            <View style={styles.detailRow}>
              <FontAwesome name="map-marker" size={scaledIcon(16)} color={colors.primary[500]} />
              <Text style={styles.detailText}>{trip.arrival_address}</Text>
            </View>
          )}
          {realtimeLocation?.recordedAt && (
            <View style={styles.detailRow}>
              <FontAwesome name="wifi" size={scaledIcon(16)} color={colors.success[500]} />
              <Text style={styles.detailText}>
                Derniere position : {formatTime(realtimeLocation.recordedAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleCall}>
            <FontAwesome name="phone" size={scaledIcon(20)} color={colors.primary[500]} />
            <Text style={styles.actionText}>Appeler</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleMessage}>
            <FontAwesome name="comment" size={scaledIcon(20)} color={colors.primary[500]} />
            <Text style={styles.actionText}>Message</Text>
          </Pressable>
        </View>

        <Button
          title="Fermer"
          variant="outline"
          onPress={() => router.back()}
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
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  errorText: {
    ...typography.body,
    color: colors.gray[600],
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    gap: spacing[3],
  },
  noMapText: {
    ...typography.body,
    color: colors.gray[400],
  },
  liveOverlay: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  liveDot: {
    width: ms(8, 0.5),
    height: ms(8, 0.5),
    borderRadius: ms(8, 0.5) / 2,
    backgroundColor: colors.white,
  },
  liveBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[6],
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarPlaceholder: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary[600],
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.h3,
    color: colors.gray[900],
  },
  tripStatus: {
    ...typography.bodySmall,
    color: colors.info[600],
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  batteryText: {
    ...typography.bodySmall,
    color: colors.gray[600],
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  alertBannerText: {
    ...typography.bodySmall,
    color: colors.error[700],
    fontWeight: '600',
  },
  tripDetails: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  detailText: {
    ...typography.body,
    color: colors.gray[700],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  actionText: {
    ...typography.button,
    color: colors.primary[500],
  },
});
