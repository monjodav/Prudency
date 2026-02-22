import { supabase } from './supabaseClient';
import { TripRow, TripInsert, TripUpdate } from '@/src/types/trip';
import { TRIP_STATUS } from '@/src/utils/constants';
import { createTripSchema } from '@/src/utils/validators';

export interface CreateTripInput {
  arrivalAddress?: string;
  arrivalLat?: number;
  arrivalLng?: number;
  departureAddress?: string;
  departureLat?: number;
  departureLng?: number;
  estimatedDurationMinutes: number;
}

export async function createTrip(input: CreateTripInput): Promise<TripRow> {
  createTripSchema.parse(input);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const now = new Date();
  const estimatedArrival = new Date(
    now.getTime() + input.estimatedDurationMinutes * 60 * 1000,
  );

  const insertData: TripInsert = {
    user_id: user.id,
    status: TRIP_STATUS.ACTIVE,
    arrival_address: input.arrivalAddress ?? null,
    arrival_lat: input.arrivalLat ?? null,
    arrival_lng: input.arrivalLng ?? null,
    departure_address: input.departureAddress ?? null,
    departure_lat: input.departureLat ?? null,
    departure_lng: input.departureLng ?? null,
    estimated_duration_minutes: input.estimatedDurationMinutes,
    started_at: now.toISOString(),
    estimated_arrival_at: estimatedArrival.toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function getTrips(): Promise<TripRow[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function getActiveTrip(): Promise<TripRow | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

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
  updates: Partial<
    Pick<
      TripRow,
      | 'arrival_address'
      | 'arrival_lat'
      | 'arrival_lng'
      | 'departure_address'
      | 'departure_lat'
      | 'departure_lng'
      | 'estimated_arrival_at'
      | 'estimated_duration_minutes'
      | 'status'
    >
  >,
): Promise<TripRow> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData: TripUpdate = {
    ...updates,
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function extendTrip(
  id: string,
  additionalMinutes: number,
): Promise<TripRow> {
  const trip = await getTripById(id);
  const currentArrival = new Date(trip.estimated_arrival_at ?? Date.now());
  const base = currentArrival.getTime() < Date.now()
    ? Date.now()
    : currentArrival.getTime();
  const newArrival = new Date(base + additionalMinutes * 60 * 1000);
  const newDuration = (trip.estimated_duration_minutes ?? 0) + additionalMinutes;

  return updateTrip(id, {
    estimated_arrival_at: newArrival.toISOString(),
    estimated_duration_minutes: newDuration,
  });
}

export async function cancelTrip(id: string): Promise<TripRow> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData: TripUpdate = {
    status: TRIP_STATUS.CANCELLED,
    cancelled_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}

export async function completeTrip(id: string): Promise<TripRow> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData: TripUpdate = {
    status: TRIP_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripRow;
}
