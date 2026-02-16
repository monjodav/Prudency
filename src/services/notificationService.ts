import { supabase } from './supabaseClient';

export async function registerPushToken(token: string): Promise<void> {
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { error } = await supabase.functions.invoke('register-push-token', {
    body: { token },
  });

  if (error) {
    throw error;
  }
}
