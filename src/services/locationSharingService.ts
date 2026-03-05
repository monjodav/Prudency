import * as Location from 'expo-location';
import { supabase } from './supabaseClient';
import { Database } from '@/src/types/database';
import { getBatteryLevel } from '@/src/utils/battery';
import { useTripStore } from '@/src/stores/tripStore';

type TripLocationRow = Database['public']['Tables']['trip_locations']['Row'];

const ALERT_GPS_INTERVAL_MS = 10_000; // 10s during alert (vs 30s normal)
const ALERT_DISTANCE_INTERVAL_M = 20; // 20m during alert (vs 50m normal)

let alertTrackingSubscription: Location.LocationSubscription | null = null;

export async function startAlertTracking(tripId: string): Promise<void> {
  if (alertTrackingSubscription) {
    return;
  }

  alertTrackingSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: ALERT_GPS_INTERVAL_MS,
      distanceInterval: ALERT_DISTANCE_INTERVAL_M,
    },
    async (location) => {
      const { latitude: lat, longitude: lng } = location.coords;
      const store = useTripStore.getState();
      store.updateLocation(lat, lng);

      try {
        const battery = await getBatteryLevel();
        store.setBatteryLevel(battery);

        await supabase.from('trip_locations').insert({
          trip_id: tripId,
          lat,
          lng,
          accuracy: location.coords.accuracy ?? null,
          speed: location.coords.speed ?? null,
          heading: location.coords.heading ?? null,
          battery_level: battery,
          recorded_at: new Date().toISOString(),
        });
      } catch {
        // Location update failed — do not disrupt alert tracking
      }
    },
  );
}

export async function stopAlertTracking(): Promise<void> {
  if (alertTrackingSubscription) {
    alertTrackingSubscription.remove();
    alertTrackingSubscription = null;
  }
}

export function buildGoogleMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export async function getLastKnownLocations(
  tripId: string,
  limit = 10,
): Promise<TripLocationRow[]> {
  const { data, error } = await supabase
    .from('trip_locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as TripLocationRow[];
}
