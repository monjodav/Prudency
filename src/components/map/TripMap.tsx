import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { Loader } from '@/src/components/ui/Loader';
import { colors } from '@/src/theme/colors';
import { getMapStyle } from '@/src/theme/mapStyles';
import { usePreferencesStore } from '@/src/stores/preferencesStore';
import { UserLocationDot } from '@/src/components/icons/UserLocationDot';
import { ms } from '@/src/utils/scaling';
import type { RouteSegment, RouteStep } from '@/src/services/directionsService';

const USER_DOT_SIZE = ms(32, 0.4);

interface LatLng {
  lat: number;
  lng: number;
}

interface TripMapProps {
  departure?: LatLng | null;
  arrival?: LatLng | null;
  routeCoordinates?: { latitude: number; longitude: number }[];
  routeSegments?: RouteSegment[];
  steps?: RouteStep[];
  bottomPadding?: number;
  showUserLocation?: boolean;
  userLocation?: LatLng | null;
  userHeading?: number | null;
  followUser?: boolean;
  style?: ViewStyle;
  onMapReady?: () => void;
}

export interface TripMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
}

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const EDGE_PADDING = { top: 100, right: 80, bottom: 80, left: 80 };

export const TripMap = forwardRef<TripMapRef, TripMapProps>(function TripMap(
  {
    departure,
    arrival,
    routeCoordinates,
    routeSegments,
    steps,
    bottomPadding,
    showUserLocation = false,
    userLocation,
    userHeading,
    followUser = false,
    style,
    onMapReady,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const [isReady, setIsReady] = useState(false);
  const mapTheme = usePreferencesStore((s) => s.mapTheme);
  const mapStyle = useMemo(() => getMapStyle(mapTheme), [mapTheme]);
  const isDarkMap = mapStyle.length > 0;
  const WALKING_COLOR = isDarkMap ? '#FFFFFF' : '#000000';

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      mapRef.current?.animateToRegion(region, duration);
    },
  }));

  const fitToMarkers = useCallback(() => {
    const points: { latitude: number; longitude: number }[] = [];
    if (departure) points.push({ latitude: departure.lat, longitude: departure.lng });
    if (arrival) points.push({ latitude: arrival.lat, longitude: arrival.lng });
    if (routeSegments && routeSegments.length > 0) {
      for (const seg of routeSegments) points.push(...seg.coordinates);
    } else if (routeCoordinates) {
      points.push(...routeCoordinates);
    }

    const edgePadding = {
      ...EDGE_PADDING,
      bottom: bottomPadding ?? EDGE_PADDING.bottom,
    };

    if (points.length >= 2) {
      mapRef.current?.fitToCoordinates(points, { edgePadding, animated: true });
    } else if (points.length === 1) {
      const point = points[0];
      if (point) {
        mapRef.current?.animateToRegion(
          { latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          500,
        );
      }
    }
  }, [departure, arrival, routeCoordinates, routeSegments, bottomPadding]);

  const handleMapReady = useCallback(() => {
    setIsReady(true);
    if (!followUser) {
      fitToMarkers();
    }
    onMapReady?.();
  }, [fitToMarkers, onMapReady, followUser]);

  // Re-zoom when route coordinates or segments change after mount (overview mode only)
  useEffect(() => {
    if (!isReady || followUser) return;
    const hasSegments = routeSegments && routeSegments.length > 0;
    const hasCoords = routeCoordinates && routeCoordinates.length >= 2;
    if (hasSegments || hasCoords) {
      fitToMarkers();
    }
  }, [isReady, followUser, routeCoordinates, routeSegments, fitToMarkers]);

  // Follow user location when followUser is enabled
  useEffect(() => {
    if (!isReady || !followUser || !userLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      300,
    );
  }, [isReady, followUser, userLocation?.lat, userLocation?.lng]);

  const transitStops = useMemo(() => {
    if (!steps) return [];
    const seen = new Set<string>();
    const result: { key: string; lat: number; lng: number; color: string }[] = [];
    for (const step of steps) {
      if (step.travelMode !== 'TRANSIT' || !step.transitDetails) continue;
      const color = step.transitDetails.line.color;
      for (const stop of [step.transitDetails.departureStop, step.transitDetails.arrivalStop]) {
        const coordKey = `${stop.location.lat.toFixed(5)},${stop.location.lng.toFixed(5)}`;
        if (seen.has(coordKey)) continue;
        seen.add(coordKey);
        result.push({ key: coordKey, lat: stop.location.lat, lng: stop.location.lng, color });
      }
    }
    return result;
  }, [steps]);

  const center = followUser ? (userLocation ?? departure) : (departure ?? userLocation);
  const followDelta = 0.005;
  const overviewDelta = 0.05;
  const delta = followUser ? followDelta : overviewDelta;
  const initialRegion = center
    ? { latitude: center.lat, longitude: center.lng, latitudeDelta: delta, longitudeDelta: delta }
    : DEFAULT_REGION;

  return (
    <View style={[styles.container, style]}>
      {!isReady && (
        <View style={styles.loading}>
          <Loader size="lg" />
        </View>
      )}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={mapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={handleMapReady}
      >
        {showUserLocation && userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={userHeading != null}
          >
            <UserLocationDot size={USER_DOT_SIZE} heading={userHeading} />
          </Marker>
        )}
        {transitStops.map((stop) => (
          <Marker
            key={stop.key}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={[styles.stopDot, { borderColor: stop.color }]} />
          </Marker>
        ))}
        {departure && (
          <Marker
            coordinate={{ latitude: departure.lat, longitude: departure.lng }}
            anchor={{ x: 0.5, y: 0.95 }}
            tracksViewChanges={false}
          >
            <Ionicons name="location-sharp" size={ms(32, 0.4)} color={colors.success[500]} />
          </Marker>
        )}
        {arrival && (
          <Marker
            coordinate={{ latitude: arrival.lat, longitude: arrival.lng }}
            anchor={{ x: 0.5, y: 0.95 }}
            tracksViewChanges={false}
          >
            <Ionicons name="location-sharp" size={ms(32, 0.4)} color={colors.error[500]} />
          </Marker>
        )}
        {routeSegments && routeSegments.length > 0
          ? routeSegments.map((segment, i) => (
              <Polyline
                key={`seg-${i}`}
                coordinates={segment.coordinates}
                strokeColor={segment.isDashed ? WALKING_COLOR : segment.color}
                strokeWidth={segment.isDashed ? 5 : 5}
                lineDashPattern={segment.isDashed ? [12, 10] : undefined}
                lineCap={segment.isDashed ? 'butt' : 'round'}
              />
            ))
          : routeCoordinates && routeCoordinates.length >= 2 && (
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
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.gray[900],
  },
  map: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
  },
  stopDot: {
    width: ms(10, 0.4),
    height: ms(10, 0.4),
    borderRadius: ms(5, 0.4),
    backgroundColor: colors.white,
    borderWidth: 2.5,
  },
});
