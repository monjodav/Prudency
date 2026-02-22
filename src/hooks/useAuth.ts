import { useCallback } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useTripStore } from '@/src/stores/tripStore';
import * as authService from '@/src/services/authService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  // Auth state is managed by AuthGate in _layout.tsx to avoid duplicate listeners
  const { session, user, isLoading, reset } = useAuthStore();
  const queryClient = useQueryClient();

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
    mutationFn: ({
      email,
      password,
      metadata,
    }: {
      email: string;
      password: string;
      metadata?: { first_name?: string };
    }) => authService.signUpWithEmail(email, password, metadata),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (
      updates: Parameters<typeof authService.updateProfile>[0]
    ) => authService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const signOut = useCallback(async () => {
    await authService.signOut();
    queryClient.clear();
    useTripStore.getState().reset();
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
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
    signOut,
    refetchProfile: profileQuery.refetch,
  };
}
