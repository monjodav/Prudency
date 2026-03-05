import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from './supabaseClient';
import { updateLocationSchema, UpdateLocationInput } from '@/src/utils/validators';
import { Database } from '@/src/types/database';
import { getBatteryLevel } from '@/src/utils/battery';
import { useTripStore } from '@/src/stores/tripStore';
import { getTrackingConfig } from '@/src/utils/trackingStrategy';
import { OfflineQueue } from '@/src/utils/offlineQueue';

type TripLocationRow = Database['public']['Tables']['trip_locations']['Row'];
type TripLocationInsert = Database['public']['Tables']['trip_locations']['Insert'];

export const BACKGROUND_LOCATION_TASK = 'PRUDENCY_BACKGROUND_LOCATION';

export const locationQueue = new OfflineQueue<TripLocationInsert>('locations');

// Load persisted queue on module init
locationQueue.load().catch(() => undefined);

async function insertLocation(data: TripLocationInsert): Promise<void> {
  const { error } = await supabase
    .from('trip_locations')
    .insert(data);

  if (error) {
    throw error;
  }
}

export async function updateLocation(
  input: UpdateLocationInput
): Promise<TripLocationRow> {
  const validated = updateLocationSchema.parse(input);

  const insertData: TripLocationInsert = {
    trip_id: validated.tripId,
    lat: validated.lat,
    lng: validated.lng,
    accuracy: validated.accuracy ?? null,
    speed: validated.speed ?? null,
    heading: validated.heading ?? null,
    battery_level: validated.batteryLevel ?? null,
    recorded_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trip_locations')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripLocationRow;
}

export async function updateLocationWithQueue(
  input: UpdateLocationInput,
): Promise<void> {
  const validated = updateLocationSchema.parse(input);

  const insertData: TripLocationInsert = {
    trip_id: validated.tripId,
    lat: validated.lat,
    lng: validated.lng,
    accuracy: validated.accuracy ?? null,
    speed: validated.speed ?? null,
    heading: validated.heading ?? null,
    battery_level: validated.batteryLevel ?? null,
    recorded_at: new Date().toISOString(),
  };

  try {
    await insertLocation(insertData);

    // On successful insert, try flushing any queued items
    if (locationQueue.size > 0) {
      await locationQueue.flush(insertLocation);
    }
  } catch {
    await locationQueue.enqueue(insertData);
  }
}

export async function flushLocationQueue(): Promise<{ sent: number; failed: number }> {
  return locationQueue.flush(insertLocation);
}

export async function getLastKnownLocation(
  tripId: string
): Promise<TripLocationRow | null> {
  const { data, error } = await supabase
    .from('trip_locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as TripLocationRow | null;
}

export interface BackgroundTrackingOptions {
  timeInterval: number;
  distanceInterval: number;
  accuracy: Location.Accuracy;
}

export async function startBackgroundTracking(
  options?: BackgroundTrackingOptions,
): Promise<void> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    throw new Error('Permission de localisation au premier plan refusee');
  }

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    throw new Error('Permission de localisation en arriere-plan refusee');
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }

  const store = useTripStore.getState();
  const config = options ?? getTrackingConfig(store.trackingMode, store.batteryLevel);

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: config.accuracy,
    timeInterval: config.timeInterval,
    distanceInterval: config.distanceInterval,
    deferredUpdatesInterval: config.timeInterval,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Prudency - Trajet en cours',
      notificationBody: 'Votre position est suivie pour votre securite',
      notificationColor: '#2c41bc',
    },
  });
}

export async function restartBackgroundTracking(
  options: BackgroundTrackingOptions,
): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (!isRegistered) {
    return;
  }

  await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: options.accuracy,
    timeInterval: options.timeInterval,
    distanceInterval: options.distanceInterval,
    deferredUpdatesInterval: options.timeInterval,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Prudency - Trajet en cours',
      notificationBody: 'Votre position est suivie pour votre securite',
      notificationColor: '#2c41bc',
    },
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

function isLocationData(data: unknown): data is { locations: Location.LocationObject[] } {
  return (
    data != null &&
    typeof data === 'object' &&
    'locations' in data &&
    Array.isArray((data as Record<string, unknown>).locations)
  );
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    return;
  }

  if (!isLocationData(data) || data.locations.length === 0) {
    return;
  }

  const store = useTripStore.getState();
  const tripId = store.activeTripId;

  if (!tripId) {
    return;
  }

  const location = data.locations[0];
  if (!location) {
    return;
  }
  const { latitude: lat, longitude: lng } = location.coords;

  // Always update local store, even if offline
  store.updateLocation(lat, lng);

  try {
    const battery = await getBatteryLevel();
    store.setBatteryLevel(battery);

    await updateLocationWithQueue({
      tripId,
      lat,
      lng,
      accuracy: location.coords.accuracy ?? undefined,
      speed: location.coords.speed ?? undefined,
      heading: location.coords.heading ?? undefined,
      batteryLevel: battery,
    });
  } catch {
    // Queue handles persistence — local store is already updated
  }
});
