import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { PermissionGlow } from '@/src/components/ui/PermissionGlow';
import { scaledSpacing, scaledFontSize, scaledLineHeight } from '@/src/utils/scaling';

/**
 * Autorisation Localisation 1 - Location permission request
 * If denied, shows "Autorisation Localisation 2" state with settings link
 */
export default function PermissionsLocationScreen() {
  const router = useRouter();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        await Location.requestBackgroundPermissionsAsync();
        router.push('/(auth)/permissions-notifications');
      } else {
        setPermissionDenied(true);
      }
    } catch {
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleSkip = () => {
    setPermissionDenied(true);
  };

  // Autorisation Localisation 2 - Denied state
  if (permissionDenied) {
    return (
      <OnboardingBackground>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Localisation requise{'\n'}pour utiliser Prudency</Text>
          <Text style={styles.subtitle}>
            Sans la localisation, je ne peux pas assurer ton trajet. Tu peux l'activer à tout moment dans les réglages, quand tu te sentiras prêt(e).
          </Text>
        </View>

        <View style={styles.glowContainer}>
          <PermissionGlow icon="shield-check" />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Activer ma localisation dans les réglages"
            onPress={openSettings}
            fullWidth
          />
          <Button
            title="Plus tard"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/(auth)/permissions-notifications')}
            fullWidth
          />
        </View>
      </OnboardingBackground>
    );
  }

  // Autorisation Localisation 1 - Initial state (triggers native dialog)
  return (
    <OnboardingBackground>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Active ta localisation</Text>
        <Text style={styles.subtitle}>
          Prudency utilise la localisation pour assurer ta sécurité lors de tes déplacements.
        </Text>
      </View>

      <View style={styles.glowContainer}>
        <PermissionGlow icon="shield-check" />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Activer ma localisation"
          onPress={requestLocationPermission}
          loading={loading}
          fullWidth
        />
        <Button
          title="Plus tard"
          variant="ghost"
          size="sm"
          onPress={handleSkip}
          fullWidth
        />
      </View>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    paddingHorizontal: scaledSpacing(50),
    alignItems: 'center',
    paddingTop: scaledSpacing(140),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(8),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
  },
  glowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: scaledSpacing(24),
    paddingBottom: scaledSpacing(24),
    gap: scaledSpacing(8),
  },
});
