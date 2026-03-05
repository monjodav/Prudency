import { useEffect, useRef, useCallback } from 'react';
import { useTripStore } from '@/src/stores/tripStore';
import { distanceToDestination } from '@/src/utils/arrivalDetection';
import type { TripRow } from '@/src/types/trip';

/** Distance in meters at which the user is considered "near" destination */
const ARRIVAL_PROXIMITY_METERS = 200;

/** Minimum number of consecutive proximity readings before triggering */
const MIN_CONSECUTIVE_READINGS = 2;

interface UseArrivalDetectionOptions {
  trip: TripRow | null;
  onArrivalDetected: () => void;
  enabled?: boolean;
}

export function useArrivalDetection({
  trip,
  onArrivalDetected,
  enabled = true,
}: UseArrivalDetectionOptions) {
  const lastKnownLat = useTripStore((s) => s.lastKnownLat);
  const lastKnownLng = useTripStore((s) => s.lastKnownLng);
  const consecutiveRef = useRef(0);
  const firedRef = useRef(false);

  const arrivalLat = trip?.arrival_lat;
  const arrivalLng = trip?.arrival_lng;
  const tripId = trip?.id;

  const reset = useCallback(() => {
    consecutiveRef.current = 0;
    firedRef.current = false;
  }, []);

  useEffect(() => {
    reset();
  }, [tripId, reset]);

  useEffect(() => {
    if (!enabled || firedRef.current) return;
    if (lastKnownLat === null || lastKnownLng === null) return;
    if (arrivalLat == null || arrivalLng == null) return;
    if (trip?.status !== 'active') return;

    const distance = distanceToDestination(
      { lat: lastKnownLat, lng: lastKnownLng },
      { lat: arrivalLat, lng: arrivalLng },
    );

    if (distance <= ARRIVAL_PROXIMITY_METERS) {
      consecutiveRef.current += 1;
      if (consecutiveRef.current >= MIN_CONSECUTIVE_READINGS) {
        firedRef.current = true;
        onArrivalDetected();
      }
    } else {
      consecutiveRef.current = 0;
    }
  }, [
    lastKnownLat,
    lastKnownLng,
    arrivalLat,
    arrivalLng,
    trip?.status,
    enabled,
    onArrivalDetected,
  ]);

  return { reset };
}
