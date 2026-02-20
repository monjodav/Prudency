import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
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
      <View style={styles.logoTopContainer}>
        <PrudencyLogo size="md" />
      </View>
      <View style={styles.content}>
        <View style={styles.concentricContainer}>
          <View style={[styles.circle, styles.circleOuter]} />
          <View style={[styles.circle, styles.circleMiddle]} />
          <View style={[styles.circle, styles.circleInner]} />
          <Ionicons name="notifications-outline" size={scaledIcon(40)} color={colors.primary[50]} />
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
    borderRadius: 9999,
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
