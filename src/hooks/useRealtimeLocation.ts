import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/src/services/supabaseClient';
import { Database } from '@/src/types/database';

type TripLocationRow = Database['public']['Tables']['trip_locations']['Row'];

export interface RealtimeLocationState {
  lat: number;
  lng: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  batteryLevel: number | null;
  recordedAt: string | null;
  estimatedBatteryMinutes: number | null;
}

function estimateBatteryMinutesLeft(batteryLevel: number | null): number | null {
  if (batteryLevel == null || batteryLevel <= 0) return null;
  // Rough estimate: ~10h total battery with GPS active = 600 min at 100%
  const MINUTES_PER_PERCENT = 6;
  return Math.round(batteryLevel * MINUTES_PER_PERCENT);
}

function rowToState(row: TripLocationRow): RealtimeLocationState {
  return {
    lat: row.lat,
    lng: row.lng,
    accuracy: row.accuracy,
    speed: row.speed,
    heading: row.heading,
    batteryLevel: row.battery_level,
    recordedAt: row.recorded_at,
    estimatedBatteryMinutes: estimateBatteryMinutesLeft(row.battery_level),
  };
}

interface UseRealtimeLocationOptions {
  tripId: string | null;
  enabled?: boolean;
}

export function useRealtimeLocation({
  tripId,
  enabled = true,
}: UseRealtimeLocationOptions) {
  const [location, setLocation] = useState<RealtimeLocationState | null>(null);
  const [locationHistory, setLocationHistory] = useState<RealtimeLocationState[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchLatestLocation = useCallback(async () => {
    if (!tripId) return;

    const { data, error } = await supabase
      .from('trip_locations')
      .select('*')
      .eq('trip_id', tripId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const state = rowToState(data as TripLocationRow);
      setLocation(state);
      setLocationHistory([state]);
    }
  }, [tripId]);

  useEffect(() => {
    if (!tripId || !enabled) {
      setLocation(null);
      setLocationHistory([]);
      setIsConnected(false);
      return;
    }

    fetchLatestLocation();

    const channel = supabase
      .channel(`trip-locations-${tripId}`)
      .on<TripLocationRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_locations',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const state = rowToState(payload.new);
          setLocation(state);
          setLocationHistory((prev) => {
            const MAX_HISTORY = 100;
            const next = [...prev, state];
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
          });
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [tripId, enabled, fetchLatestLocation]);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return {
    location,
    locationHistory,
    isConnected,
    disconnect,
    refetch: fetchLatestLocation,
  };
}
