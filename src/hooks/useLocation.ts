import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useTripStore } from '@/src/stores/tripStore';
import * as locationService from '@/src/services/locationService';
import { getBatteryLevel } from '@/src/utils/battery';
import { APP_CONFIG } from '@/src/utils/constants';
import { requestLocationPermission } from '@/src/utils/permissions';

export function useLocation() {
  const {
    activeTripId,
    isTracking,
    setTracking,
    updateLocation,
    setBatteryLevel,
  } = useTripStore();

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async () => {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    if (watchRef.current) {
      return;
    }

    setTracking(true);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: APP_CONFIG.GPS_UPDATE_INTERVAL_MS,
        distanceInterval: 50,
      },
      async (location) => {
        const { latitude: lat, longitude: lng } = location.coords;
        updateLocation(lat, lng);

        if (!activeTripId) {
          return;
        }

        try {
          const battery = await getBatteryLevel();
          setBatteryLevel(battery);

          await locationService.updateLocation({
            tripId: activeTripId,
            lat,
            lng,
            accuracy: location.coords.accuracy ?? undefined,
            speed: location.coords.speed ?? undefined,
            heading: location.coords.heading ?? undefined,
            batteryLevel: battery,
          });
        } catch {
          // Silently fail on location update errors to avoid disrupting tracking
        }
      }
    );
  }, [activeTripId, setTracking, updateLocation, setBatteryLevel]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setTracking(false);
  }, [setTracking]);

  const getCurrentLocation = useCallback(async () => {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
    };
  }, []);

  useEffect(() => {
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  return {
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
}
