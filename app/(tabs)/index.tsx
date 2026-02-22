import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { useTripStore } from '@/src/stores/tripStore';
import { usePlaces } from '@/src/hooks/usePlaces';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { formatDuration } from '@/src/utils/formatters';
import { TRIP_STATUS } from '@/src/utils/constants';

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#333350' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e30' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FAB_SIZE = ms(48, 0.4);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeTripId, lastKnownLat, lastKnownLng, arrivalAddress, estimatedDurationMinutes } = useTripStore();
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);

  const [showRecenter, setShowRecenter] = useState(false);

  const userLocation =
    lastKnownLat != null && lastKnownLng != null
      ? { latitude: lastKnownLat, longitude: lastKnownLng }
      : null;

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  const handleAlert = () => {
    router.push('/(trip)/create');
  };

  const handleRecenter = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
    setShowRecenter(false);
  }, [userLocation]);

  const handleRegionChange = useCallback(() => {
    if (userLocation) setShowRecenter(true);
  }, [userLocation]);

  const tabBarHeight = ms(60, 0.3) + insets.bottom;

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onRegionChangeComplete={handleRegionChange}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            pinColor={colors.primary[400]}
          />
        ))}
      </MapView>

      {/* Alert button — top center */}
      <View style={[styles.alertContainer, { top: insets.top + spacing[4] }]}>
        <AlertButton onTrigger={handleAlert} size={ms(60, 0.4)} />
      </View>

      {/* Right-side floating action buttons */}
      <View style={[styles.fabColumn, { top: insets.top + spacing[4] }]}>
        <Pressable
          style={styles.fab}
          onPress={() => Alert.alert('Notifications', 'Bientot disponible')}
        >
          <Ionicons name="notifications-outline" size={scaledIcon(22)} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(tabs)/contacts')}
        >
          <Ionicons name="people-outline" size={scaledIcon(22)} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(trip)/create')}
        >
          <Ionicons name="add" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
      </View>

      {/* Recenter button — bottom left */}
      {showRecenter && (
        <Pressable
          style={[styles.recenterButton, { bottom: tabBarHeight + spacing[4] }]}
          onPress={handleRecenter}
        >
          <Ionicons name="locate" size={scaledIcon(22)} color={colors.primary[500]} />
        </Pressable>
      )}

      {/* Active trip card — bottom */}
      {activeTripId && (
        <Pressable
          style={[styles.activeTripCard, { bottom: tabBarHeight + spacing[4] }]}
          onPress={() => router.push('/(trip)/active')}
        >
          <View style={styles.activeTripLeft}>
            <Ionicons name="navigate" size={scaledIcon(20)} color={colors.primary[300]} />
            <View style={styles.activeTripInfo}>
              <Text style={styles.activeTripDestination} numberOfLines={1}>
                {arrivalAddress ?? 'Trajet en cours'}
              </Text>
              {estimatedDurationMinutes != null && (
                <Text style={styles.activeTripTime}>
                  {formatDuration(estimatedDurationMinutes)} restantes
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={scaledIcon(18)} color={colors.primary[300]} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  alertContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  fabColumn: {
    position: 'absolute',
    right: spacing[4],
    gap: spacing[3],
    alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary[950],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  recenterButton: {
    position: 'absolute',
    left: spacing[4],
    width: ms(44, 0.4),
    height: ms(44, 0.4),
    borderRadius: ms(22, 0.4),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  activeTripCard: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: 'rgba(44, 65, 188, 0.9)',
    borderRadius: scaledRadius(16),
    ...shadows.lg,
  },
  activeTripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  activeTripInfo: {
    flex: 1,
  },
  activeTripDestination: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  activeTripTime: {
    ...typography.caption,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
});
