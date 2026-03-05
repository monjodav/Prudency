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
  const isChecking = useRef(false);
  // Track the session id that triggered the last profile check to avoid
  // re-running while a check for the same session is still in flight.
  const checkedSessionId = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Reset so the next useEffect run will re-check profile
      isChecking.current = false;
      checkedSessionId.current = null;
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/(auth)/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading, router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // No session → must be in auth group
    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Session exists but profile check already in flight for this session
    if (isChecking.current && checkedSessionId.current === session.user.id) {
      return;
    }

    // Session exists — always check profile completeness before allowing (tabs)
    isChecking.current = true;
    checkedSessionId.current = session.user.id;

    void (async () => {
      try {
        const profile = await queryClient.fetchQuery({
          queryKey: ['profile'],
          queryFn: getProfile,
          staleTime: 0,
        });

        if (!profile?.first_name || !profile?.phone) {
          if (!inAuthGroup || segments[1] !== 'personal-info') {
            router.replace('/(auth)/personal-info');
          }
        } else if (!profile.phone_verified) {
          if (!inAuthGroup || segments[1] !== 'verify-phone') {
            router.replace({
              pathname: '/(auth)/verify-phone',
              params: { phone: profile.phone },
            });
          }
        } else if (!profile.onboarding_completed) {
          if (!inAuthGroup || !['permissions-location', 'permissions-notifications', 'onboarding', 'add-contact', 'add-contact-form'].includes(segments[1] as string)) {
            router.replace('/(auth)/permissions-location');
          }
        } else if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      } catch {
        if (!inAuthGroup) {
          router.replace('/(auth)/personal-info');
        }
      } finally {
        isChecking.current = false;
      }
    })();
  }, [session, isLoading, segments, router]);
}
