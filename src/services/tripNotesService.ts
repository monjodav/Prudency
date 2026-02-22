import { supabase } from './supabaseClient';
import { TripNote, TripNoteInsert } from '@/src/types/database';
import { tripNoteSchema } from '@/src/utils/validators';
import { encryptContent, decryptContent } from '@/src/utils/encryption';

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

  const encrypted = await encryptContent(validated.content);

  const insertData: TripNoteInsert = {
    trip_id: validated.tripId,
    user_id: user.id,
    content: encrypted,
    lat: validated.lat ?? null,
    lng: validated.lng ?? null,
    is_encrypted: true,
  };

  const { data, error } = await supabase
    .from('trip_notes')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { ...(data as TripNote), content: validated.content };
}

export async function getTripNotes(tripId: string): Promise<TripNote[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trip_notes')
    .select('*')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const notes = (data ?? []) as TripNote[];

  const decrypted = await Promise.all(
    notes.map(async (note) => {
      if (note.is_encrypted) {
        return { ...note, content: await decryptContent(note.content) };
      }
      return note;
    }),
  );

  return decrypted;
}

export async function updateTripNote(noteId: string, content: string): Promise<TripNote> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecte');
  }

  const encrypted = await encryptContent(content);

  const { data, error } = await supabase
    .from('trip_notes')
    .update({ content: encrypted, is_encrypted: true })
    .eq('id', noteId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { ...(data as TripNote), content };
}
