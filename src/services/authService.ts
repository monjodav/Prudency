import { supabase } from './supabaseClient';
import { Database } from '@/src/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getProfile(): Promise<Profile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function updateProfile(
  updates: Omit<ProfileUpdate, 'id' | 'created_at' | 'updated_at'>
): Promise<Profile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  } as never;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}
