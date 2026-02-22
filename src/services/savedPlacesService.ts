import { z } from 'zod';
import { supabase } from './supabaseClient';
import type { SavedPlace, SavedPlaceInsert, SavedPlaceUpdate } from '@/src/types/database';

const placeTypeSchema = z.enum(['home', 'work', 'favorite', 'other']);

const createPlaceSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  address: z.string().min(1, 'Adresse requise').max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  place_type: placeTypeSchema.optional(),
  icon: z.string().max(50).optional(),
});

const updatePlaceSchema = createPlaceSchema.partial();

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;

export async function getSavedPlaces(): Promise<SavedPlace[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('saved_places')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavedPlace[];
}

export async function createSavedPlace(input: CreatePlaceInput): Promise<SavedPlace> {
  const validated = createPlaceSchema.parse(input);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const insertData: SavedPlaceInsert = {
    ...validated,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('saved_places')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as SavedPlace;
}

export async function updateSavedPlace(
  id: string,
  input: UpdatePlaceInput,
): Promise<SavedPlace> {
  const validated = updatePlaceSchema.parse(input);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('saved_places')
    .update(validated as SavedPlaceUpdate)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedPlace;
}

export async function deleteSavedPlace(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
