import { supabase } from './supabaseClient';
import { TripRow, TripInsert, TripUpdate, TripCreateInput } from '@/src/types/trip';
import { createTripSchema } from '@/src/utils/validators';
import { TRIP_STATUS } from '@/src/utils/constants';

export async function createTrip(input: TripCreateInput): Promise<TripRow> {
  const validated = createTripSchema.parse({
    estimatedDurationMinutes: input.estimatedDurationMinutes,
    departureAddress: input.departureAddress,
    departureCoords:
      input.departureLat != null && input.departureLng != null
        ? { lat: input.departureLat, lng: input.departureLng }
        : undefined,
    arrivalAddress: input.arrivalAddress,
    arrivalCoords:
      input.arrivalLat != null && input.arrivalLng != null
        ? { lat: input.arrivalLat, lng: input.arrivalLng }
        : undefined,
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const now = new Date();
  const estimatedArrival = new Date(
    now.getTime() + validated.estimatedDurationMinutes * 60 * 1000
  );

  const insertData: TripInsert = {
    user_id: user.id,
    status: TRIP_STATUS.ACTIVE,
    departure_address: validated.departureAddress ?? null,
    departure_lat: validated.departureCoords?.lat ?? null,
    departure_lng: validated.departureCoords?.lng ?? null,
    arrival_address: validated.arrivalAddress ?? null,
    arrival_lat: validated.arrivalCoords?.lat ?? null,
    arrival_lng: validated.arrivalCoords?.lng ?? null,
    estimated_duration_minutes: validated.estimatedDurationMinutes,
    started_at: now.toISOString(),
    estimated_arrival_at: estimatedArrival.toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function getTrips(): Promise<TripRow[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as TripRow[];
}

export async function getTripById(id: string): Promise<TripRow> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function getActiveTrip(): Promise<TripRow | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .in('status', [TRIP_STATUS.ACTIVE, TRIP_STATUS.ALERTED])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as TripRow | null;
}

export async function updateTrip(
  id: string,
  updates: Partial<Pick<TripRow, 'departure_address' | 'departure_lat' | 'departure_lng' | 'arrival_address' | 'arrival_lat' | 'arrival_lng' | 'estimated_duration_minutes'>>
): Promise<TripRow> {
  const updateData: TripUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function cancelTrip(id: string): Promise<TripRow> {
  const updateData: TripUpdate = {
    status: TRIP_STATUS.CANCELLED,
    cancelled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function completeTrip(id: string): Promise<TripRow> {
  const updateData: TripUpdate = {
    status: TRIP_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}
