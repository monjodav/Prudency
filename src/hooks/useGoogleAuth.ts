import { useState, useCallback } from 'react';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/services/supabaseClient';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = 'prudency://google-auth';

interface GoogleAuthState {
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  const signInWithGoogle = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URI,
          queryParams: { prompt: 'consent' },
        },
      });

      if (error || !data.url) {
        throw error ?? new Error('Impossible de lancer la connexion Google');
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        REDIRECT_URI,
      );

      if (result.type !== 'success' || !result.url) {
        setState({ isLoading: false, error: null });
        return null;
      }

      const params = QueryParams.getQueryParams(result.url);
      const accessToken = params.params['access_token'];
      const refreshToken = params.params['refresh_token'];

      if (!accessToken || !refreshToken) {
        throw new Error("Aucun token reçu de Google");
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError) {
        throw sessionError;
      }

      return sessionData;
    } catch (err: unknown) {
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
