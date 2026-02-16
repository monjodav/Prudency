import { supabase } from './supabaseClient';
import { updateLocationSchema, UpdateLocationInput } from '@/src/utils/validators';
import { Database } from '@/src/types/database';

type TripLocationRow = Database['public']['Tables']['trip_locations']['Row'];
type TripLocationInsert = Database['public']['Tables']['trip_locations']['Insert'];

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
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripLocationRow;
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
