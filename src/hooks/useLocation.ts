import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useTripStore } from '@/src/stores/tripStore';
import * as locationService from '@/src/services/locationService';
import { getBatteryLevel } from '@/src/utils/battery';
import { requestLocationPermission } from '@/src/utils/permissions';
import {
  resolveTrackingMode,
  getTrackingConfig,
  shouldUpdateTracking,
  type TrackingMode,
} from '@/src/utils/trackingStrategy';

interface AdaptiveTrackingOptions {
  tripStatus: string | null;
  remainingMinutes: number | null;
  tripStartedAt: string | null;
}

export function useLocation(options?: AdaptiveTrackingOptions) {
  const {
    activeTripId,
    isTracking,
    trackingMode,
    isAlerted,
    batteryLevel,
    setTracking,
    setTrackingMode,
    updateLocation,
    setBatteryLevel,
  } = useTripStore();

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const startingRef = useRef(false);
  const currentModeRef = useRef<TrackingMode>('idle');

  const handleLocationUpdate = useCallback(
    async (location: Location.LocationObject) => {
      const { latitude: lat, longitude: lng } = location.coords;
      updateLocation(lat, lng);

      const tripId = useTripStore.getState().activeTripId;
      if (!tripId) {
        return;
      }

      try {
        const battery = await getBatteryLevel();
        setBatteryLevel(battery);

        await locationService.updateLocationWithQueue({
          tripId,
          lat,
          lng,
          accuracy: location.coords.accuracy ?? undefined,
          speed: location.coords.speed ?? undefined,
          heading: location.coords.heading ?? undefined,
          batteryLevel: battery,
        });
      } catch {
        // Silently fail to avoid disrupting tracking
      }
    },
    [updateLocation, setBatteryLevel],
  );

  const applyTrackingConfig = useCallback(async (mode: TrackingMode) => {
    const config = getTrackingConfig(mode, batteryLevel);

    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: config.accuracy,
        timeInterval: config.timeInterval,
        distanceInterval: config.distanceInterval,
      },
      handleLocationUpdate,
    );

    try {
      await locationService.restartBackgroundTracking(config);
    } catch {
      // Background restart not critical
    }

    currentModeRef.current = mode;
    setTrackingMode(mode);
  }, [batteryLevel, handleLocationUpdate, setTrackingMode]);

  const startTracking = useCallback(async () => {
    if (watchRef.current || startingRef.current) return;
    startingRef.current = true;

    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        throw new Error('Permission de localisation refusee');
      }

      setTracking(true);

      const initialMode = resolveTrackingMode(
        options?.tripStatus ?? 'active',
        isAlerted,
        options?.remainingMinutes ?? null,
        options?.tripStartedAt ?? null,
      );

      const config = getTrackingConfig(initialMode, batteryLevel);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          timeInterval: config.timeInterval,
          distanceInterval: config.distanceInterval,
        },
        handleLocationUpdate,
      );

      currentModeRef.current = initialMode;
      setTrackingMode(initialMode);

      try {
        await locationService.startBackgroundTracking(config);
      } catch {
        // Background tracking not available
      }
    } finally {
      startingRef.current = false;
    }
  }, [
    options?.tripStatus,
    options?.remainingMinutes,
    options?.tripStartedAt,
    isAlerted,
    batteryLevel,
    setTracking,
    setTrackingMode,
    handleLocationUpdate,
  ]);

  const stopTracking = useCallback(async () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }

    try {
      await locationService.stopBackgroundTracking();
    } catch {
      // Ignore errors when stopping
    }

    currentModeRef.current = 'idle';
    setTracking(false);
    setTrackingMode('idle');
  }, [setTracking, setTrackingMode]);

  const getCurrentLocation = useCallback(async (
    accuracy: Location.Accuracy = Location.Accuracy.High,
  ) => {
    const permission = await requestLocationPermission();
    if (permission !== 'granted') {
      throw new Error('Permission de localisation refusee');
    }

    const location = await Location.getCurrentPositionAsync({ accuracy });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
    };
  }, []);

  // Adapt tracking mode when trip context changes
  useEffect(() => {
    if (!isTracking || !activeTripId) {
      return;
    }

    const newMode = resolveTrackingMode(
      options?.tripStatus ?? null,
      isAlerted,
      options?.remainingMinutes ?? null,
      options?.tripStartedAt ?? null,
    );

    if (shouldUpdateTracking(currentModeRef.current, newMode)) {
      applyTrackingConfig(newMode);
    }
  }, [
    isTracking,
    activeTripId,
    options?.tripStatus,
    options?.remainingMinutes,
    options?.tripStartedAt,
    isAlerted,
    applyTrackingConfig,
  ]);

  // Adapt when battery level crosses threshold
  useEffect(() => {
    if (!isTracking || !activeTripId) {
      return;
    }

    const mode = currentModeRef.current;
    if (mode === 'idle') {
      return;
    }

    // Re-apply same mode with updated battery context
    applyTrackingConfig(mode);
  // Only react to battery crossing the threshold, not every change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batteryLevel !== null && batteryLevel <= 20]);

  // Cleanup on unmount
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
    trackingMode,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
}
