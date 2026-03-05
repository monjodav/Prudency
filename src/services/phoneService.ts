import { supabase } from './supabaseClient';

export async function checkPhoneAvailability(phone: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('check-phone', {
    body: { phone },
  });

  if (error) {
    throw new Error('Erreur lors de la vérification du numéro');
  }

  return data?.available === true;
}
