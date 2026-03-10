import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Button } from '@/src/components/ui/Button';
import { resetPassword } from '@/src/services/authService';
import { supabase } from '@/src/services/supabaseClient';
import { useAuthStore } from '@/src/stores/authStore';
import { scaledIcon, scaledLineHeight, scaledSpacing } from '@/src/utils/scaling';

type Provider = 'apple' | 'google' | 'email';

function detectProvider(session: { user: { app_metadata?: Record<string, unknown> } } | null): Provider {
  const provider = session?.user?.app_metadata?.provider;
  if (provider === 'apple') return 'apple';
  if (provider === 'google') return 'google';
  return 'email';
}

const PROVIDER_CONFIG: Record<Provider, {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  buttonLabel: string;
  iconColor: string;
}> = {
  email: {
    icon: 'mail-outline',
    title: 'Réinitialiser par email',
    description:
      'Un email te sera envoyé avec un lien pour créer un nouveau mot de passe.',
    buttonLabel: 'Envoyer le lien',
    iconColor: colors.primary[300],
  },
  apple: {
    icon: 'logo-apple',
    title: 'Connecté avec Apple',
    description:
      'Ton compte est lié à ton identifiant Apple. Pour modifier ton mot de passe, rends-toi dans les réglages de ton Apple ID.',
    buttonLabel: 'Ouvrir les réglages Apple',
    iconColor: colors.white,
  },
  google: {
    icon: 'logo-google',
    title: 'Connecté avec Google',
    description:
      'Ton compte est lié à ton compte Google. Pour modifier ton mot de passe, rends-toi dans les paramètres de sécurité Google.',
    buttonLabel: 'Ouvrir les paramètres Google',
    iconColor: '#4285F4',
  },
};

export default function ChangePasswordScreen() {
  const session = useAuthStore((s) => s.session);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const provider = detectProvider(session);
  const config = PROVIDER_CONFIG[provider];

  const handlePress = async () => {
    if (provider === 'apple') {
      Linking.openURL('App-prefs:APPLE_ACCOUNT');
      return;
    }

    if (provider === 'google') {
      Linking.openURL('https://myaccount.google.com/security');
      return;
    }

    // Email provider — send reset link
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        Alert.alert('Erreur', 'Impossible de trouver ton adresse email.');
        return;
      }
      await resetPassword(user.email);
      setEmailSent(true);
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer l'email. Réessaie plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DarkScreen scrollable headerTitle="Changer le mot de passe">
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={scaledIcon(32)} color={config.iconColor} />
        </View>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>

        {emailSent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={scaledIcon(20)} color={colors.success[400]} />
            <Text style={styles.successText}>
              Email envoyé ! Vérifie ta boîte mail.
            </Text>
          </View>
        ) : (
          <Button
            title={config.buttonLabel}
            onPress={handlePress}
            loading={isLoading}
            fullWidth
          />
        )}
      </View>
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  iconContainer: {
    width: scaledIcon(64),
    height: scaledIcon(64),
    borderRadius: scaledIcon(32),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSpacing(8),
    backgroundColor: 'rgba(48, 196, 102, 0.1)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  successText: {
    ...typography.body,
    color: colors.success[400],
  },
});
