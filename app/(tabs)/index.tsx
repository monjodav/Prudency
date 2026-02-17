import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius, scaledShadow } from '@/src/utils/scaling';
import { useTripStore } from '@/src/stores/tripStore';
import { useAuthStore } from '@/src/stores/authStore';
import { usePlaces } from '@/src/hooks/usePlaces';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { TripStatusIndicator } from '@/src/components/trip/TripStatus';
import { PlacesList } from '@/src/components/places/PlacesList';
import { TRIP_STATUS } from '@/src/utils/constants';
import type { SavedPlace } from '@/src/types/database';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_SNAP_LOW = SCREEN_HEIGHT * 0.3;
const SHEET_SNAP_HIGH = SCREEN_HEIGHT * 0.6;

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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeTripId, lastKnownLat, lastKnownLng } = useTripStore();
  const { user } = useAuthStore();
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

  // --- Bottom sheet animation ---
  const sheetHeight = useRef(new Animated.Value(SHEET_SNAP_LOW)).current;
  const lastSnapRef = useRef(SHEET_SNAP_LOW);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        const next = lastSnapRef.current - g.dy;
        const clamped = Math.max(0, Math.min(next, SHEET_SNAP_HIGH));
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        const current = lastSnapRef.current - g.dy;
        const mid = (SHEET_SNAP_LOW + SHEET_SNAP_HIGH) / 2;
        const target = current > mid ? SHEET_SNAP_HIGH : SHEET_SNAP_LOW;
        lastSnapRef.current = target;
        Animated.spring(sheetHeight, {
          toValue: target,
          useNativeDriver: false,
          damping: 20,
          stiffness: 150,
        }).start();
      },
    }),
  ).current;

  // --- Handlers ---
  const handleStartTrip = () => {
    router.push(activeTripId ? '/(trip)/active' : '/(trip)/create');
  };

  const handleAlert = () => {};

  const handleRecenter = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
    setShowRecenter(false);
  }, [userLocation]);

  const handlePlacePress = useCallback((place: SavedPlace) => {
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500,
    );
    setShowRecenter(true);
  }, []);

  const handleRegionChange = useCallback(() => {
    if (userLocation) setShowRecenter(true);
  }, [userLocation]);

  const firstName = user?.user_metadata?.first_name;
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour';
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

      {/* Header overlay */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Ou allez-vous aujourd'hui ?</Text>
      </View>

      {/* Active trip indicator */}
      {activeTripId && (
        <Pressable
          style={[styles.activeTrip, { top: insets.top + ms(80, 0.4) }]}
          onPress={() => router.push('/(trip)/active')}
        >
          <TripStatusIndicator status={TRIP_STATUS.ACTIVE} />
          <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.primary[300]} />
        </Pressable>
      )}

      {/* Floating action buttons */}
      <View style={[styles.floatingActions, { bottom: tabBarHeight + SHEET_SNAP_LOW + spacing[4] }]}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
            activeTripId ? styles.activeButton : undefined,
          ]}
          onPress={handleStartTrip}
        >
          <Ionicons
            name={activeTripId ? 'navigate' : 'add'}
            size={scaledIcon(28)}
            color={colors.white}
          />
          <Text style={styles.startButtonText}>
            {activeTripId ? 'Voir mon trajet' : 'Commencer un trajet'}
          </Text>
        </Pressable>
        {!activeTripId && <AlertButton onTrigger={handleAlert} size={ms(56, 0.5)} />}
      </View>

      {/* Recenter button */}
      {showRecenter && (
        <Pressable
          style={[styles.recenterButton, { bottom: tabBarHeight + SHEET_SNAP_LOW + spacing[4] }]}
          onPress={handleRecenter}
        >
          <Ionicons name="locate" size={scaledIcon(22)} color={colors.primary[500]} />
        </Pressable>
      )}

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight, paddingBottom: tabBarHeight }]}>
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>
        <PlacesList places={places} onPlacePress={handlePlacePress} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  greeting: {
    ...typography.h1,
    color: colors.white,
    ...shadows.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.primary[200],
    marginTop: spacing[2],
  },
  activeTrip: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: 'rgba(44, 65, 188, 0.85)',
    borderRadius: scaledRadius(12),
    borderWidth: 1,
    borderColor: 'rgba(44, 65, 188, 0.4)',
  },
  floatingActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing[4],
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    ...scaledShadow({
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  startButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.25,
  },
  activeButton: {
    backgroundColor: colors.success[500],
    shadowColor: colors.success[500],
  },
  startButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing[2],
  },
  recenterButton: {
    position: 'absolute',
    right: spacing[4],
    width: ms(44, 0.4),
    height: ms(44, 0.4),
    borderRadius: ms(22, 0.4),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: scaledRadius(20),
    borderTopRightRadius: scaledRadius(20),
    ...shadows.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: ms(40, 0.5),
    height: ms(4, 0.5),
    backgroundColor: colors.gray[300],
    borderRadius: scaledRadius(2),
  },
});
