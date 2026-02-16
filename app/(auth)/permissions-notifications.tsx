import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

/**
 * Autorisation Notification - Notification permission request
 * Explains why notifications are important for safety alerts
 */
export default function PermissionsNotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      await Notifications.requestPermissionsAsync();

      // Continue to onboarding regardless of permission status
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
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={scaledIcon(80)} color={colors.primary[50]} />
        </View>

        <Text style={styles.title}>Autoriser les notifications</Text>
        <Text style={styles.subtitle}>
          Je pourrai te prévenir en cas de retard ou si quelque chose semble inhabituel pendant ton trajet.
        </Text>

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
            onPress={handleSkip}
            fullWidth
          />
        </View>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>PRUDENCY</Text>
      </View>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: scaledSpacing(40),
    paddingTop: scaledSpacing(120),
    alignItems: 'center',
  },
  iconContainer: {
    width: ms(120, 0.5),
    height: ms(120, 0.5),
    borderRadius: scaledRadius(60),
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(32),
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
  logoContainer: {
    alignItems: 'center',
    paddingBottom: scaledSpacing(40),
  },
  logo: {
    fontSize: scaledFontSize(35),
    fontWeight: '200',
    fontFamily: 'Montserrat_200ExtraLight',
    color: colors.white,
    letterSpacing: ms(2, 0.3),
    textAlign: 'center',
  },
});
