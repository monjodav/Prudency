import { supabase } from './supabaseClient';
import { TripNote, TripNoteInsert } from '@/src/types/database';
import { tripNoteSchema } from '@/src/utils/validators';

export interface CreateNoteInput {
  tripId: string;
  content: string;
  lat?: number;
  lng?: number;
}

export async function createTripNote(input: CreateNoteInput): Promise<TripNote> {
  const validated = tripNoteSchema.parse(input);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const insertData: TripNoteInsert = {
    trip_id: validated.tripId,
    user_id: user.id,
    content: validated.content,
    lat: validated.lat ?? null,
    lng: validated.lng ?? null,
  };

  const { data, error } = await supabase
    .from('trip_notes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripNote;
}

export async function getTripNotes(tripId: string): Promise<TripNote[]> {
  const { data, error } = await supabase
    .from('trip_notes')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as TripNote[];
}

export async function updateTripNote(noteId: string, content: string): Promise<TripNote> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecte');
  }

  const { data, error } = await supabase
    .from('trip_notes')
    .update({ content })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TripNote;
}
