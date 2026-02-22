import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/src/services/supabaseClient';
import { useAuthStore } from '@/src/stores/authStore';
import { queryClient } from '@/src/config/queryClient';
import { getProfile } from '@/src/services/authService';

export function useAuthGate() {
  const { session, isLoading, setSession, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const profileCheckDone = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      profileCheckDone.current = false;
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      profileCheckDone.current = false;
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup && !profileCheckDone.current) {
      profileCheckDone.current = true;
      void (async () => {
        try {
          const profile = await queryClient.fetchQuery({
            queryKey: ['profile'],
            queryFn: getProfile,
          });

          if (!profile?.first_name || !profile?.phone) {
            router.replace('/(auth)/personal-info');
          } else if (!profile.onboarding_completed) {
            router.replace('/(auth)/permissions-location');
          } else {
            router.replace('/(tabs)');
          }
        } catch {
          router.replace('/(tabs)');
        }
      })();
    }
  }, [session, isLoading, segments, router]);
}
