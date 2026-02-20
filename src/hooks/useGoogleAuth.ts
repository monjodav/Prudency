import { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/services/supabaseClient';
import { env } from '@/src/config/env';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

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
      const error = new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID non configure');
      setState({ isLoading: false, error });
      throw error;
    }

    setState({ isLoading: true, error: null });

    try {
      const authUrl =
        `${GOOGLE_DISCOVERY.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(env.googleWebClientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&nonce=${Math.random().toString(36).substring(2)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
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

      const idToken = params.get('id_token');

      if (!idToken) {
        throw new Error("Aucun token d'identite recu de Google");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
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
