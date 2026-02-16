import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { supabase } from '@/src/services/supabaseClient';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('Email requis');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide');
      return false;
    }
    setError(null);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (resetError) {
        throw resetError;
      }

      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <OnboardingBackground>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={scaledIcon(48)} color={colors.primary[50]} />
            </View>
            <Text style={styles.title}>Email envoyé !</Text>
            <Text style={styles.subtitle}>
              Si un compte existe avec l'adresse {email}, tu recevras un lien pour
              réinitialiser ton mot de passe.
            </Text>
          </View>

          <View style={styles.spacer} />

          <Button
            title="Retour à la connexion"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
          />

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PRUDENCY</Text>
          </View>
        </ScrollView>
      </OnboardingBackground>
    );
  }

  return (
    <OnboardingBackground>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={scaledIcon(24)} color={colors.primary[50]} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Saisis ton adresse email et nous t'enverrons un lien pour
              réinitialiser ton mot de passe.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="E-mail *"
              placeholder="exemple@gmail.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              error={error ?? undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              variant="dark"
            />

            <Button
              title="Envoyer le lien"
              onPress={handleResetPassword}
              loading={loading}
              fullWidth
              disabled={!email.trim()}
            />
          </View>

          <View style={styles.spacer} />

          {/* Logo at bottom */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PRUDENCY</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaledSpacing(64),
    paddingTop: scaledSpacing(60),
    paddingBottom: scaledSpacing(40),
  },
  backButton: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
    marginLeft: scaledSpacing(-8),
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(32),
  },
  iconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: scaledRadius(40),
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(12),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
    opacity: 0.9,
  },
  form: {
    gap: scaledSpacing(24),
  },
  spacer: {
    flex: 1,
    minHeight: scaledSpacing(40),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: scaledSpacing(32),
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
