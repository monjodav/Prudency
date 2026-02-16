import Constants from 'expo-constants';

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleMapsApiKey: string;
  googleWebClientId: string;
}

function getEnvConfig(): EnvConfig {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!supabaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    googleMapsApiKey: googleMapsApiKey ?? '',
    googleWebClientId: googleWebClientId ?? '',
  };
}

export const env = getEnvConfig();

export const appVersion = Constants.expoConfig?.version ?? '1.0.0';
export const appName = Constants.expoConfig?.name ?? 'Prudency';
