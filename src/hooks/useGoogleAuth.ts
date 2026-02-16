import { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/services/supabaseClient';
import { env } from '@/src/config/env';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthState {
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  const redirectUri = AuthSession.makeRedirectUri();

  const signInWithGoogle = useCallback(async () => {
    if (!env.googleWebClientId) {
      const error = new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID non configuré');
      setState({ isLoading: false, error });
      throw error;
    }

    setState({ isLoading: true, error: null });

    try {
      const { data: oauthData, error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
            queryParams: {
              client_id: env.googleWebClientId,
            },
          },
        });

      if (oauthError) {
        throw oauthError;
      }

      if (!oauthData.url) {
        throw new Error('Aucune URL de redirection');
      }

      const result = await WebBrowser.openAuthSessionAsync(
        oauthData.url,
        redirectUri
      );

      if (result.type !== 'success' || !result.url) {
        setState({ isLoading: false, error: null });
        return null;
      }

      const url = new URL(result.url);
      const params = new URLSearchParams(
        url.hash ? url.hash.substring(1) : url.search.substring(1)
      );

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        throw new Error("Aucun token d'accès recu");
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? '',
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error('Erreur lors de la connexion Google');
      setState({ isLoading: false, error });
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [redirectUri]);

  return {
    signInWithGoogle,
    isLoading: state.isLoading,
    error: state.error,
  };
}
