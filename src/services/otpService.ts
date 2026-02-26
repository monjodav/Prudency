import { supabase } from './supabaseClient';

async function extractErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (
    error &&
    typeof error === 'object' &&
    'context' in error &&
    error.context instanceof Response
  ) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch {
      // Body already consumed or not JSON
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function sendOtp(phone: string): Promise<void> {
  console.log('[sendOtp] calling send-otp with phone:', phone);
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { phone },
  });
  console.log('[sendOtp] response data:', JSON.stringify(data));
  console.log('[sendOtp] response error:', JSON.stringify(error));

  if (error) {
    const message = await extractErrorMessage(
      error,
      "Erreur lors de l'envoi du code",
    );
    console.log('[sendOtp] extracted message:', message);
    throw new Error(message);
  }
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('verify-otp', {
    body: { phone, code },
  });

  if (error) {
    const message = await extractErrorMessage(
      error,
      'Erreur lors de la vérification du code',
    );
    throw new Error(message);
  }

  return data?.verified === true;
}
