import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { UserLocationDot } from '@/src/components/icons/UserLocationDot';
import { getMapStyle } from '@/src/theme/mapStyles';
import { usePreferencesStore } from '@/src/stores/preferencesStore';
import { useTripStore } from '@/src/stores/tripStore';
import { usePlaces } from '@/src/hooks/usePlaces';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { useNotificationsQuery } from '@/src/hooks/useNotificationsQuery';
import { Text } from 'react-native';

function isInFrance(lat: number, lng: number): boolean {
  return lat >= 41.3 && lat <= 51.1 && lng >= -5.2 && lng <= 9.6;
}

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
  const { lastKnownLat, lastKnownLng, updateLocation } = useTripStore();
  const { places } = usePlaces();
  const { unreadCount } = useNotificationsQuery();
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
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 10000,
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

  const pathname = usePathname();
  const outsideFrance = userLocation && pathname === '/'
    ? !isInFrance(userLocation.latitude, userLocation.longitude)
    : false;

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
  const fabBottom = insets.bottom + FOOTER_HEIGHT + gap * 3;

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

      {/* Outside France banner */}
      {outsideFrance && (
        <View style={[styles.outsideFranceBanner, { top: insets.top + ms(72, 0.4) }]}>
          <Ionicons name="information-circle-outline" size={scaledIcon(16)} color={colors.warning[400]} />
          <Text style={styles.outsideFranceText}>
            Prudency n'est disponible qu'en France métropolitaine
          </Text>
        </View>
      )}

      {/* Right-side floating action buttons — bottom right */}
      <View style={[styles.fabColumn, { bottom: fabBottom }]}>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={scaledIcon(22)} color={colors.white} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
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
  badge: {
    position: 'absolute',
    top: -ms(2, 0.4),
    right: -ms(2, 0.4),
    minWidth: ms(18, 0.4),
    height: ms(18, 0.4),
    borderRadius: ms(9, 0.4),
    backgroundColor: colors.brandPosition[50],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(4, 0.4),
  },
  badgeText: {
    color: colors.white,
    fontSize: ms(10, 0.4),
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  outsideFranceBanner: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
    zIndex: 10,
  },
  outsideFranceText: {
    ...typography.caption,
    color: colors.warning[400],
    flex: 1,
  },
});
