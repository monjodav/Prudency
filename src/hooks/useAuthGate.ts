import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/src/services/supabaseClient';
import { useAuthStore } from '@/src/stores/authStore';
import { queryClient } from '@/src/config/queryClient';
import { getProfile } from '@/src/services/authService';
import { getActiveTrip } from '@/src/services/tripService';

const ONBOARDING_SCREENS = [
  'permissions-location',
  'permissions-notifications',
  'onboarding',
  'add-contact',
  'add-contact-form',
];

export function useAuthGate() {
  const { session, isLoading, setSession, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const isChecking = useRef(false);
  // Keep a live ref so the async callback reads the latest segments
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      isChecking.current = false;
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading, router]);

  // Redirect unauthenticated users immediately (synchronous, no fetch)
  useEffect(() => {
    if (isLoading) return;
    if (!session && segments[0] !== '(auth)') {
      router.replace('/(auth)/login');
    }
  }, [session, isLoading, segments, router]);

  // Check profile completeness once when session appears (not on every segment change)
  useEffect(() => {
    if (isLoading || !session || isChecking.current) return;

    isChecking.current = true;

    void (async () => {
      try {
        const profile = await queryClient.fetchQuery({
          queryKey: ['profile'],
          queryFn: getProfile,
          staleTime: 0,
        });

        // Read segments at resolution time, not at launch time
        const currentSegments = segmentsRef.current;
        const inAuthGroup = currentSegments[0] === '(auth)';
        const currentScreen = currentSegments[1] as string | undefined;

        if (!profile?.first_name || !profile?.phone) {
          if (!inAuthGroup || currentScreen !== 'personal-info') {
            router.replace('/(auth)/personal-info');
          }
        } else if (!profile.phone_verified) {
          if (!inAuthGroup || currentScreen !== 'verify-phone') {
            router.replace({
              pathname: '/(auth)/verify-phone',
              params: { phone: profile.phone },
            });
          }
        } else if (!profile.onboarding_completed) {
          if (!inAuthGroup || !ONBOARDING_SCREENS.includes(currentScreen ?? '')) {
            router.replace('/(auth)/permissions-location');
          }
        } else if (inAuthGroup) {
          const activeTrip = await getActiveTrip();
          if (activeTrip) {
            router.replace('/(trip)/active');
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch {
        const inAuthGroup = segmentsRef.current[0] === '(auth)';
        if (!inAuthGroup) {
          router.replace('/(auth)/personal-info');
        }
      } finally {
        isChecking.current = false;
      }
    })();
  }, [session, isLoading, router]);
}
