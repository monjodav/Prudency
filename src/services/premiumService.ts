import { supabase } from './supabaseClient';
import { Profile } from '@/src/types/database';

export interface PremiumStatus {
  isPremium: boolean;
  premiumSince: string | null;
}

export async function getPremiumStatus(): Promise<PremiumStatus> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('is_premium, premium_since')
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  const profile = data as Pick<Profile, 'is_premium' | 'premium_since'>;

  return {
    isPremium: profile.is_premium ?? false,
    premiumSince: profile.premium_since ?? null,
  };
}

export async function activatePremium(): Promise<PremiumStatus> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_premium: true,
      premium_since: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('is_premium, premium_since')
    .single();

  if (error) {
    throw error;
  }

  const profile = data as Pick<Profile, 'is_premium' | 'premium_since'>;

  return {
    isPremium: profile.is_premium ?? false,
    premiumSince: profile.premium_since ?? null,
  };
}

export async function deactivatePremium(): Promise<PremiumStatus> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_premium: false,
      premium_since: null,
    })
    .eq('id', user.id)
    .select('is_premium, premium_since')
    .single();

  if (error) {
    throw error;
  }

  const profile = data as Pick<Profile, 'is_premium' | 'premium_since'>;

  return {
    isPremium: profile.is_premium ?? false,
    premiumSince: profile.premium_since ?? null,
  };
}
