import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Montserrat_200ExtraLight,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { Kalam_400Regular } from '@expo-google-fonts/kalam';

import { useColorScheme } from '@/components/useColorScheme';
import { queryClient } from '@/src/config/queryClient';
import { supabase } from '@/src/services/supabaseClient';
import { useAuthStore } from '@/src/stores/authStore';
import { AnimatedSplashScreen } from '@/src/components/splash';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
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
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, phone, onboarding_completed')
            .eq('id', session.user.id)
            .single();

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

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Inter (primary font from Figma)
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Montserrat (logo font from Figma)
    Montserrat_200ExtraLight,
    Montserrat_400Regular,
    Montserrat_700Bold,
    // Kalam (handwritten accent font from Figma)
    Kalam_400Regular,
    // FontAwesome icons
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      // Show splash screen for 2 seconds
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <AuthGate>
            <Slot />
          </AuthGate>
          {showSplash && (
            <AnimatedSplashScreen
              isLoading={!appReady}
              onAnimationComplete={handleSplashComplete}
            />
          )}
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
