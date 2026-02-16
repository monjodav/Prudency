import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/stores/authStore';
import { scaledFontSize, figmaScale, ms } from '@/src/utils/scaling';

/**
 * Page de chargement - Splash screen
 * Displays the PRUDENCY logo while checking auth state
 * Matches Figma design: dark blue bg with violet blur ellipse
 */
export default function LoadingScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (!isLoading) {
      // Small delay for animation to complete
      const timer = setTimeout(() => {
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, session, router]);

  return (
    <View style={styles.container}>
      {/* Background gradient ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      {/* Centered logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>PRUDENCY</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950], // #040924
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400], // #8d689e
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: scaledFontSize(46), // From Figma: 45.97px
    fontWeight: '200',
    fontFamily: 'Montserrat_200ExtraLight',
    color: colors.white,
    letterSpacing: ms(3, 0.3),
    textAlign: 'center',
  },
});
