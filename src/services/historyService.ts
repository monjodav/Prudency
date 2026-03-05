import { supabase } from './supabaseClient';
import { TripRow, TripLocationRow } from '@/src/types/trip';
import { AlertRow } from '@/src/types/alert';
import { TRIP_STATUS } from '@/src/utils/constants';

const PAST_TRIP_STATUSES = [
  TRIP_STATUS.COMPLETED,
  TRIP_STATUS.CANCELLED,
  TRIP_STATUS.TIMEOUT,
] as const;

export async function getPastTrips(
  limit = 50,
  offset = 0,
): Promise<TripRow[]> {
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
    .in('status', PAST_TRIP_STATUSES)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data as TripRow[];
}

export async function getPastTripById(id: string): Promise<TripRow> {
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

export async function getTripLocations(
  tripId: string,
): Promise<TripLocationRow[]> {
  const { data, error } = await supabase
    .from('trip_locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('recorded_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data as TripLocationRow[];
}

export async function getAlertsByTripId(
  tripId: string,
): Promise<AlertRow[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .order('triggered_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as AlertRow[];
}

export async function getPastAlerts(
  limit = 50,
  offset = 0,
): Promise<AlertRow[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .not('resolved_at', 'is', null)
    .order('triggered_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data as AlertRow[];
}

export async function getPastAlertById(id: string): Promise<AlertRow> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as AlertRow;
}
