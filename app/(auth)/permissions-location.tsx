import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { borderRadius as radii } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

/**
 * Autorisation Localisation 1 - Location permission request
 * If denied, shows "Autorisation Localisation 2" state with settings link
 * As per Figma notes: If refused, redirect to Location 2 screen
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
        // Also request background permission for trip tracking
        await Location.requestBackgroundPermissionsAsync();

        // Continue to next screen regardless of background permission
        router.push('/(auth)/permissions-notifications');
      } else {
        // Show denied state
        setPermissionDenied(true);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de demander la permission de localisation');
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
    // Allow skipping but warn user
    Alert.alert(
      'Localisation requise',
      'Sans la localisation, Prudency ne pourra pas sécuriser tes trajets. Tu peux l\'activer plus tard dans les réglages.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer sans',
          onPress: () => router.push('/(auth)/permissions-notifications'),
          style: 'destructive'
        },
      ]
    );
  };

  // Autorisation Localisation 2 - Denied state
  if (permissionDenied) {
    return (
      <OnboardingBackground>
        <View style={styles.logoTopContainer}>
          <PrudencyLogo size="md" />
        </View>
        <View style={styles.content}>
          <View style={styles.concentricContainer}>
            <View style={[styles.circle, styles.circleOuter]} />
            <View style={[styles.circle, styles.circleMiddle]} />
            <View style={[styles.circle, styles.circleInner]} />
            <Ionicons name="location-outline" size={scaledIcon(40)} color={colors.primary[50]} />
          </View>

          <Text style={styles.title}>Localisation requise pour utiliser Prudency</Text>
          <Text style={styles.subtitle}>
            Sans la localisation, je ne peux pas assurer ton trajet. Tu peux l'activer à tout moment dans les réglages, quand tu te sentiras prêt(e).
          </Text>

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
        </View>

      </OnboardingBackground>
    );
  }

  // Autorisation Localisation 1 - Initial state
  return (
    <OnboardingBackground>
      <View style={styles.logoTopContainer}>
        <PrudencyLogo size="md" />
      </View>
      <View style={styles.content}>
        <View style={styles.concentricContainer}>
          <View style={[styles.circle, styles.circleOuter]} />
          <View style={[styles.circle, styles.circleMiddle]} />
          <View style={[styles.circle, styles.circleInner]} />
          <Ionicons name="navigate-outline" size={scaledIcon(40)} color={colors.primary[50]} />
        </View>

        <Text style={styles.title}>Active ta localisation</Text>
        <Text style={styles.subtitle}>
          Prudency utilise la localisation pour assurer ta sécurité lors de tes déplacements.
        </Text>

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
      </View>

    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  logoTopContainer: {
    alignItems: 'center',
    paddingTop: scaledSpacing(80),
  },
  content: {
    flex: 1,
    paddingHorizontal: scaledSpacing(40),
    paddingTop: scaledSpacing(32),
    alignItems: 'center',
  },
  concentricContainer: {
    width: ms(160, 0.5),
    height: ms(160, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(32),
  },
  circle: {
    position: 'absolute',
    borderRadius: radii.full,
    backgroundColor: colors.secondary[400],
  },
  circleOuter: {
    width: ms(160, 0.5),
    height: ms(160, 0.5),
    opacity: 0.1,
  },
  circleMiddle: {
    width: ms(120, 0.5),
    height: ms(120, 0.5),
    opacity: 0.2,
  },
  circleInner: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    opacity: 0.3,
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(16),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
    marginBottom: scaledSpacing(40),
  },
  buttonContainer: {
    width: '100%',
    gap: scaledSpacing(16),
  },
});
