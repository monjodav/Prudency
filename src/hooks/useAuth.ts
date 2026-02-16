import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import * as authService from '@/src/services/authService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const { session, user, isLoading, setSession, setLoading, reset } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: !!session,
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signInWithEmail(email, password),
  });

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signUpWithEmail(email, password),
  });

  const signOut = useCallback(async () => {
    await authService.signOut();
    queryClient.clear();
    reset();
  }, [queryClient, reset]);

  return {
    session,
    user,
    profile: profileQuery.data ?? null,
    isLoading,
    isProfileLoading: profileQuery.isLoading,
    isAuthenticated: !!session,
    signIn: signInMutation.mutateAsync,
    signInError: signInMutation.error,
    isSigningIn: signInMutation.isPending,
    signUp: signUpMutation.mutateAsync,
    signUpError: signUpMutation.error,
    isSigningUp: signUpMutation.isPending,
    signOut,
    refetchProfile: profileQuery.refetch,
  };
}
