import { useState, useCallback, useEffect } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '@/src/services/supabaseClient';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID =
  '796381017761-kd9frcgmvmjeef78h7101qheuh9svig6.apps.googleusercontent.com';

interface GoogleAuthState {
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: IOS_CLIENT_ID,
      webClientId: WEB_CLIENT_ID,
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!response.data?.idToken) {
        throw new Error('Aucun token reçu de Google');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        setState({ isLoading: false, error: null });
        return null;
      }

      const error =
        err instanceof Error ? err : new Error('Erreur lors de la connexion Google');
      setState({ isLoading: false, error });
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    signInWithGoogle,
    isLoading: state.isLoading,
    error: state.error,
  };
}
