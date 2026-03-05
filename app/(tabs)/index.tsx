import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, shadows } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { UserLocationDot } from '@/src/components/icons/UserLocationDot';
import { getMapStyle } from '@/src/theme/mapStyles';
import { usePreferencesStore } from '@/src/stores/preferencesStore';
import { useTripStore } from '@/src/stores/tripStore';
import { usePlaces } from '@/src/hooks/usePlaces';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { formatDuration } from '@/src/utils/formatters';

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FAB_SIZE = ms(48, 0.4);
const DOT_SIZE = ms(32, 0.4);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeTripId, lastKnownLat, lastKnownLng, arrivalAddress, estimatedDurationMinutes, updateLocation } = useTripStore();
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);

  const currentRegion = useRef<Region>(DEFAULT_REGION);
  const isFollowingUser = useRef(true);
  const [heading, setHeading] = useState<number | null>(null);
  const mapTheme = usePreferencesStore((s) => s.mapTheme);
  const mapStyle = useMemo(() => getMapStyle(mapTheme), [mapTheme]);

  // Center map on user at launch, then watch position in real time
  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;

    async function initLocation() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      // Use last known position for instant centering
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (cancelled) return;

      if (lastKnown) {
        const { latitude, longitude } = lastKnown.coords;
        updateLocation(latitude, longitude);
        const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        currentRegion.current = region;
        mapRef.current?.animateToRegion(region, 500);
      }

      // Watch position in real time
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (location) => {
          if (cancelled) return;
          const { latitude, longitude } = location.coords;
          updateLocation(latitude, longitude);
          if (location.coords.heading != null && location.coords.heading >= 0) {
            setHeading(location.coords.heading);
          }
          if (isFollowingUser.current) {
            mapRef.current?.animateToRegion(
              { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
              300,
            );
          }
        },
      );

      headingSub = await Location.watchHeadingAsync((h) => {
        if (!cancelled && h.trueHeading >= 0) {
          setHeading(h.trueHeading);
        }
      });
    }

    initLocation();

    return () => {
      cancelled = true;
      subscription?.remove();
      headingSub?.remove();
    };
  }, [updateLocation]);

  const userLocation =
    lastKnownLat != null && lastKnownLng != null
      ? { latitude: lastKnownLat, longitude: lastKnownLng }
      : null;

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  const handleAlert = () => {
    // TODO: envoyer l'alerte aux contacts de confiance via Edge Function
  };

  const handleRecenter = useCallback(() => {
    if (!userLocation) return;
    isFollowingUser.current = true;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
  }, [userLocation]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    currentRegion.current = region;
    isFollowingUser.current = false;
  }, []);

  const FOOTER_HEIGHT = ms(56, 0.4);
  const gap = spacing[3];
  const footerBottom = insets.bottom + gap;
  const fabBottom = insets.bottom + FOOTER_HEIGHT + gap + gap;

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={mapStyle}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={heading != null}
          >
            <UserLocationDot size={DOT_SIZE} heading={heading} />
          </Marker>
        )}
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
      <View style={[styles.alertContainer, { top: insets.top + spacing[2] }]}>
        <AlertButton onTrigger={handleAlert} size={ms(56, 0.4)} />
      </View>

      {/* Right-side floating action buttons — bottom right */}
      <View style={[styles.fabColumn, { bottom: fabBottom }]}>
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
          <Ionicons name="add" size={scaledIcon(22)} color={colors.white} />
        </Pressable>
      </View>

      {/* Recenter button — bottom left */}
      <View
        style={[styles.recenterButtonContainer, { bottom: fabBottom }]}
      >
        <Pressable style={styles.recenterButton} onPress={handleRecenter}>
          <Ionicons name="locate" size={scaledIcon(22)} color={colors.white} />
        </Pressable>
      </View>

      {/* Active trip card — bottom */}
      {activeTripId && (
        <Pressable
          style={[styles.activeTripCard, { bottom: fabBottom }]}
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

      {/* Navigation footer */}
      <View style={[styles.navFooter, { bottom: footerBottom }]}>
        <Pressable
          style={[styles.navItemInactive, styles.navItemLeft]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
        <Pressable style={styles.navItemActive}>
          <View style={styles.navDot} />
        </Pressable>
        <Pressable
          style={[styles.navItemInactive, styles.navItemRight]}
          onPress={() => Alert.alert('Abonnement', 'Bientôt disponible')}
        >
          <Ionicons name="star" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
      </View>

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
    overflow: 'visible',
    zIndex: 10,
  },
  fabColumn: {
    position: 'absolute',
    right: spacing[4],
    gap: spacing[4],
    alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(100, 100, 100, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: ms(25, 0.4),
    elevation: 8,
  },
  recenterButtonContainer: {
    position: 'absolute',
    left: spacing[4],
  },
  recenterButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(100, 100, 100, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: ms(25, 0.4),
    elevation: 8,
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
  navFooter: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(10, 10, 20, 0.9)',
    borderRadius: scaledRadius(28),
    overflow: 'hidden',
    zIndex: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItemLeft: {
    borderRightWidth: 1,
  },
  navItemRight: {
    borderLeftWidth: 1,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
  },
  navDot: {
    width: ms(12, 0.4),
    height: ms(12, 0.4),
    borderRadius: ms(6, 0.4),
    backgroundColor: colors.brandPosition[50],
    borderWidth: 2,
    borderColor: 'rgba(204, 99, 249, 0.4)',
  },
});
