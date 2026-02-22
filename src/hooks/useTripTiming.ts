import { useState, useEffect, useMemo } from 'react';
import type { useActiveTrip } from '@/src/hooks/useActiveTrip';

export function useTripTiming(trip: ReturnType<typeof useActiveTrip>['trip']) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!trip?.started_at) {
      return { elapsed: '00:00', remaining: '00:00', progress: 0 };
    }

    const startMs = new Date(trip.started_at).getTime();
    const arrivalMs = trip.estimated_arrival_at
      ? new Date(trip.estimated_arrival_at).getTime()
      : startMs + 30 * 60 * 1000;

    const elapsedMs = Math.max(0, now - startMs);
    const totalMs = arrivalMs - startMs;
    const remainingMs = arrivalMs - now;

    const formatDuration = (milliseconds: number): string => {
      const absSec = Math.abs(Math.floor(milliseconds / 1000));
      const m = Math.floor(absSec / 60);
      const s = absSec % 60;
      const prefix = milliseconds < 0 ? '+' : '';
      return `${prefix}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progress = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;

    return {
      elapsed: formatDuration(elapsedMs),
      remaining: formatDuration(remainingMs),
      progress,
    };
  }, [trip?.started_at, trip?.estimated_arrival_at, now]);
}
