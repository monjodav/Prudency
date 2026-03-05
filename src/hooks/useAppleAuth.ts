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

      // Apple only provides the name on first sign-in — store it in the profile.
      // The profile row is created by a DB trigger, which may not have run yet,
      // so we retry the update after a short delay if the first attempt matches 0 rows.
      const givenName = credential.fullName?.givenName;
      const familyName = credential.fullName?.familyName;
      if (data.user && (givenName || familyName)) {
        const updates: Record<string, string | null> = {};
        if (givenName) updates.first_name = givenName;
        if (familyName) updates.last_name = familyName;

        const tryUpdate = async () => {
          const { count } = await supabase
            .from('profiles')
            .update(updates, { count: 'exact' })
            .eq('id', data.user!.id);
          return (count ?? 0) > 0;
        };

        const saved = await tryUpdate();
        if (!saved) {
          // Profile row not yet created — wait for trigger and retry
          await new Promise((r) => setTimeout(r, 1000));
          await tryUpdate();
        }
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
