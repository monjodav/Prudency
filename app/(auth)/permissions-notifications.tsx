import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { PermissionGlow } from '@/src/components/ui/PermissionGlow';
import { scaledSpacing, scaledFontSize, scaledLineHeight } from '@/src/utils/scaling';

/**
 * Autorisation Notification - Notification permission request
 */
export default function PermissionsNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      await Notifications.requestPermissionsAsync();
      router.push('/(auth)/onboarding');
    } catch {
      Alert.alert('Erreur', 'Impossible de demander la permission de notification');
      router.push('/(auth)/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Notifications importantes',
      'Sans les notifications, tu ne seras pas prévenue en cas de retard ou de situation inhabituelle pendant ton trajet.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer sans',
          onPress: () => router.push('/(auth)/onboarding'),
        },
      ]
    );
  };

  return (
    <OnboardingBackground>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Autoriser les notifications</Text>
        <Text style={styles.subtitle}>
          Je pourrai te prévenir en cas de retard ou si quelque chose semble inhabituel pendant ton trajet.
        </Text>
      </View>

      <View style={styles.glowContainer}>
        <PermissionGlow icon="bell" />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Autoriser les notifications"
          onPress={requestNotificationPermission}
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
    paddingHorizontal: scaledSpacing(50),
    paddingBottom: scaledSpacing(24),
    gap: scaledSpacing(8),
  },
});
