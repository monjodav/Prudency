import { useMemo, useRef } from 'react';
import type { RouteStep } from '@/src/services/directionsService';
import { distanceToDestination } from '@/src/utils/arrivalDetection';

/**
 * Determines which step the user is currently on based on proximity.
 * Monotonic: once a step is passed, we never go back.
 */
export function useCurrentStep(
  steps: RouteStep[] | null,
  userLocation: { lat: number; lng: number } | null,
): number {
  const maxIndexRef = useRef(0);

  const nearestIndex = useMemo(() => {
    if (!steps || steps.length === 0 || !userLocation) return 0;

    let nearest = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      for (const point of step.polyline) {
        const dist = distanceToDestination(userLocation, {
          lat: point.latitude,
          lng: point.longitude,
        });
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
    }

    return nearest;
  }, [steps, userLocation?.lat, userLocation?.lng]);

  // Monotonic update: ref mutation during render is safe (idempotent, no re-render)
  if (nearestIndex > maxIndexRef.current) {
    maxIndexRef.current = nearestIndex;
  }

  return maxIndexRef.current;
}
