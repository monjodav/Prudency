import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { colors } from '@/src/theme/colors';
import { ms } from '@/src/utils/scaling';

interface LatLng {
  lat: number;
  lng: number;
}

interface TripMapProps {
  departure?: LatLng | null;
  arrival?: LatLng | null;
  routeCoordinates?: { latitude: number; longitude: number }[];
  showUserLocation?: boolean;
  userLocation?: LatLng | null;
  style?: ViewStyle;
  onMapReady?: () => void;
}

export interface TripMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a3e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#333350' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e0e1a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1e1e30' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 };

export const TripMap = forwardRef<TripMapRef, TripMapProps>(function TripMap(
  {
    departure,
    arrival,
    routeCoordinates,
    showUserLocation = false,
    userLocation,
    style,
    onMapReady,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      mapRef.current?.animateToRegion(region, duration);
    },
  }));

  const fitToMarkers = useCallback(() => {
    const points: { latitude: number; longitude: number }[] = [];
    if (departure) points.push({ latitude: departure.lat, longitude: departure.lng });
    if (arrival) points.push({ latitude: arrival.lat, longitude: arrival.lng });
    if (userLocation) points.push({ latitude: userLocation.lat, longitude: userLocation.lng });
    if (routeCoordinates) points.push(...routeCoordinates);

    if (points.length >= 2) {
      mapRef.current?.fitToCoordinates(points, { edgePadding: EDGE_PADDING, animated: true });
    } else if (points.length === 1) {
      const point = points[0];
      if (point) {
        mapRef.current?.animateToRegion(
          { latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500,
        );
      }
    }
  }, [departure, arrival, userLocation, routeCoordinates]);

  const handleMapReady = useCallback(() => {
    setIsReady(true);
    fitToMarkers();
    onMapReady?.();
  }, [fitToMarkers, onMapReady]);

  const initialRegion = departure
    ? { latitude: departure.lat, longitude: departure.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : DEFAULT_REGION;

  return (
    <View style={[styles.container, style]}>
      {!isReady && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={handleMapReady}
      >
        {departure && (
          <Marker
            coordinate={{ latitude: departure.lat, longitude: departure.lng }}
            pinColor={colors.success[500]}
            title="Depart"
          />
        )}
        {arrival && (
          <Marker
            coordinate={{ latitude: arrival.lat, longitude: arrival.lng }}
            pinColor={colors.error[500]}
            title="Arrivee"
          />
        )}
        {userLocation && !showUserLocation && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            pinColor={colors.primary[500]}
            title="Position actuelle"
          />
        )}
        {routeCoordinates && routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary[500]}
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: ms(16, 0.3),
    overflow: 'hidden',
    backgroundColor: colors.gray[900],
  },
  map: {
    height: ms(200, 0.5),
    width: '100%',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
  },
});
