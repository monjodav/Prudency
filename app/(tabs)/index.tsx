import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { useTripStore } from '@/src/stores/tripStore';
import { usePlaces } from '@/src/hooks/usePlaces';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { PlacesBottomSheet } from '@/src/components/places/PlacesBottomSheet';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { formatDuration } from '@/src/utils/formatters';
import { TRIP_STATUS } from '@/src/utils/constants';
import type { SavedPlace } from '@/src/types/database';

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
  const { activeTripId, lastKnownLat, lastKnownLng, arrivalAddress, estimatedDurationMinutes, updateLocation } = useTripStore();
  const { places, deletePlace } = usePlaces();
  const mapRef = useRef<MapView>(null);
  const lastSavedPlace = useRef<SavedPlace | null>(null);

  const [showRecenter, setShowRecenter] = useState(false);
  const [dotVisible, setDotVisible] = useState(false);
  const dotX = useRef(new Animated.Value(0)).current;
  const dotY = useRef(new Animated.Value(0)).current;
  const isFollowingUser = useRef(true);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    title: string;
    subtitle?: string;
    variant: 'success' | 'error';
    action?: { label: string; onPress: () => void };
  }>({ visible: false, title: '', variant: 'success' });
  const footerOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const handleSheetChange = useCallback((index: number) => {
    const hidden = index > 0 ? 0 : 1;
    Animated.timing(footerOpacity, {
      toValue: hidden,
      duration: 150,
      useNativeDriver: true,
    }).start();
    Animated.timing(overlayOpacity, {
      toValue: hidden,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [footerOpacity, overlayOpacity]);

  // Center map on user at launch, then watch position in real time
  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    async function initLocation() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      // Use last known position for instant centering
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (cancelled) return;

      if (lastKnown) {
        const { latitude, longitude } = lastKnown.coords;
        updateLocation(latitude, longitude);
        mapRef.current?.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500,
        );
        // Init dot position after animation
        setTimeout(() => {
          mapRef.current?.pointForCoordinate({ latitude, longitude })
            .then((point) => {
              if (cancelled) return;
              dotX.setValue(point.x - ms(16, 0.4));
              dotY.setValue(point.y - ms(16, 0.4));
              setDotVisible(true);
            })
            .catch(() => {});
        }, 550);
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
          // Sync dot pixel position
          mapRef.current?.pointForCoordinate({ latitude, longitude })
            .then((point) => {
              if (cancelled) return;
              dotX.setValue(point.x - ms(16, 0.4));
              dotY.setValue(point.y - ms(16, 0.4));
              setDotVisible(true);
            })
            .catch(() => {});
          if (isFollowingUser.current) {
            mapRef.current?.animateToRegion(
              { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
              300,
            );
          }
        },
      );
    }

    initLocation();

    return () => {
      cancelled = true;
      subscription?.remove();
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

  const handlePlacePress = useCallback(
    (place: SavedPlace) => {
      mapRef.current?.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    },
    [],
  );

  const syncDotPosition = useCallback(() => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.pointForCoordinate(userLocation)
      .then((point) => {
        dotX.setValue(point.x - ms(16, 0.4));
        dotY.setValue(point.y - ms(16, 0.4));
        setDotVisible(true);
      })
      .catch(() => {});
  }, [userLocation, dotX, dotY]);

  const handleRecenter = useCallback(() => {
    if (!userLocation) return;
    isFollowingUser.current = true;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
    setShowRecenter(false);
  }, [userLocation]);

  const handleRegionChange = useCallback(() => {
    syncDotPosition();
  }, [syncDotPosition]);

  const handleRegionChangeComplete = useCallback(() => {
    syncDotPosition();
    if (userLocation && !isFollowingUser.current) {
      setShowRecenter(true);
    }
    isFollowingUser.current = false;
  }, [userLocation, syncDotPosition]);

  const handleSaveSuccess = useCallback((place: SavedPlace) => {
    lastSavedPlace.current = place;
    setSnackbar({
      visible: true,
      title: 'Lieu enregistré',
      subtitle: 'Ton lieu a bien été enregistré',
      variant: 'success',
      action: {
        label: 'Annuler',
        onPress: () => {
          if (lastSavedPlace.current) {
            deletePlace(lastSavedPlace.current.id);
            lastSavedPlace.current = null;
          }
          setSnackbar((s) => ({ ...s, visible: false }));
        },
      },
    });
    mapRef.current?.animateToRegion(
      { latitude: place.latitude, longitude: place.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      500,
    );
  }, [deletePlace]);

  const handleSaveError = useCallback(() => {
    setSnackbar({
      visible: true,
      title: 'Lieu non enregistré',
      subtitle: 'Une erreur est survenue',
      variant: 'error',
    });
  }, []);

  const handlePlaceSelectedOnMap = useCallback((coords: { lat: number; lng: number }) => {
    mapRef.current?.animateToRegion(
      { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      500,
    );
  }, []);

  const FOOTER_HEIGHT = ms(56, 0.4);
  const sheetFirstSnap = ms(32, 0.4);
  const gap = spacing[3];
  const footerBottom = insets.bottom + sheetFirstSnap;
  const fabBottom = insets.bottom + sheetFirstSnap + FOOTER_HEIGHT + gap + gap;

  return (
    <View style={styles.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
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

      {/* Dark overlay on light map */}
      <View style={styles.mapOverlay} pointerEvents="none" />

      {/* User location dot — above overlay, follows map position */}
      {dotVisible && (
        <Animated.View
          style={[
            styles.userDotAbsolute,
            { left: dotX, top: dotY, opacity: overlayOpacity },
          ]}
          pointerEvents="none"
        >
          <View style={styles.userDotOuter}>
            <View style={styles.userDotInner} />
          </View>
        </Animated.View>
      )}

      {/* Alert button — top center */}
      <View style={[styles.alertContainer, { top: insets.top + spacing[2] }]}>
        <AlertButton onTrigger={handleAlert} size={ms(56, 0.4)} />
      </View>

      {/* Right-side floating action buttons — bottom right */}
      <Animated.View style={[styles.fabColumn, { bottom: fabBottom, opacity: overlayOpacity }]}>
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
      </Animated.View>

      {/* Recenter button — bottom left */}
      {showRecenter && (
        <Animated.View style={{ opacity: overlayOpacity }}>
          <Pressable
            style={[styles.recenterButton, { bottom: fabBottom }]}
            onPress={handleRecenter}
          >
            <Ionicons name="locate" size={scaledIcon(22)} color={colors.white} />
          </Pressable>
        </Animated.View>
      )}

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

      {/* Navigation footer — above bottom sheet, fades when sheet expanded */}
      <Animated.View style={[styles.navFooter, { bottom: footerBottom, opacity: footerOpacity }]} pointerEvents="auto">
        <Pressable
          style={[styles.navItemInactive, styles.navItemLeft]}
          onPress={() => router.push('/(tabs)/contacts')}
        >
          <Ionicons name="person" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
        <Pressable style={styles.navItemActive}>
          <View style={styles.navDot} />
        </Pressable>
        <Pressable
          style={[styles.navItemInactive, styles.navItemRight]}
          onPress={() => router.push('/(tabs)/places')}
        >
          <Ionicons name="star" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
      </Animated.View>

      {/* Places bottom sheet — swipe up to see saved places */}
      <PlacesBottomSheet
        places={places}
        onPlacePress={handlePlacePress}
        bottomInset={0}
        onSheetChange={handleSheetChange}
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
        onPlaceSelected={handlePlaceSelectedOnMap}
      />

      <Snackbar
        visible={snackbar.visible}
        title={snackbar.title}
        subtitle={snackbar.subtitle}
        variant={snackbar.variant}
        onHide={() => setSnackbar((s) => ({ ...s, visible: false }))}
        action={snackbar.action}
        duration={5000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 30, 0.55)',
  },
  userDotAbsolute: {
    position: 'absolute',
    zIndex: 2,
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
  recenterButton: {
    position: 'absolute',
    left: spacing[4],
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
  userDotOuter: {
    width: ms(32, 0.4),
    height: ms(32, 0.4),
    borderRadius: ms(16, 0.4),
    backgroundColor: 'rgba(220, 120, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDotInner: {
    width: ms(18, 0.4),
    height: ms(18, 0.4),
    borderRadius: ms(9, 0.4),
    backgroundColor: '#e08fff',
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: '#dd80ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: ms(6, 0.4),
    elevation: 8,
  },
});
