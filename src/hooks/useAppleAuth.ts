import { useState, useCallback } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/src/services/supabaseClient';

interface AppleAuthState {
  isLoading: boolean;
  error: Error | null;
}

export function useAppleAuth() {
  const [state, setState] = useState<AppleAuthState>({
    isLoading: false,
    error: null,
  });

  const signInWithApple = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Aucun token recu de Apple');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        setState({ isLoading: false, error: null });
        return null;
      }

      const error = err instanceof Error ? err : new Error('Erreur lors de la connexion Apple');
      setState({ isLoading: false, error });
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    signInWithApple,
    isLoading: state.isLoading,
    error: state.error,
  };
}
