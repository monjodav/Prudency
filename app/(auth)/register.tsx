import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuth } from '@/src/hooks/useAuth';
import { useSocialAuth } from '@/src/hooks/useSocialAuth';
import { AuthError } from '@supabase/supabase-js';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { GoogleLogo } from '@/src/components/icons/GoogleLogo';
import { AppleLogo } from '@/src/components/icons/AppleLogo';
import { FacebookLogo } from '@/src/components/icons/FacebookLogo';
import { scaledSpacing, scaledIcon } from '@/src/utils/scaling';

const CGU_URL = 'https://prudency.app/cgu';
const PRIVACY_URL = 'https://prudency.app/privacy';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const {
    signInWithGoogle,
    isGoogleLoading,
    signInWithApple,
    isAppleLoading,
    isLoading: isSocialLoading,
  } = useSocialAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedCgu, setAcceptedCgu] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Ajoute ton adresse email pour continuer.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ton mail est invalide';
    }
    if (!password) {
      newErrors.password = 'Choisis un mot de passe pour sécuriser ton compte.';
    } else if (password.length < 8) {
      newErrors.password = 'Ton mot de passe doit contenir au moins 8 caractères.';
    } else if (!/(?=.*[0-9])|(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      newErrors.password = "Ton mot de passe n'est pas assez robuste. Ajoute des chiffres ou des caractères spéciaux.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({ email: email.trim(), password });
      router.push('/(auth)/personal-info');
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.message.includes('already registered')) {
          setErrors({ email: 'Un compte existe déjà avec cet email' });
        } else {
          setErrors({ submit: err.message });
        }
      } else {
        setErrors({ submit: 'Une erreur est survenue' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert('Erreur', 'La connexion avec Google a échoué.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch {
      Alert.alert('Erreur', 'La connexion avec Apple a échoué.');
    }
  };

  const isFormValid = email.trim() !== '' && password !== '' && acceptedCgu;

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
          {/* Logo */}
          <View style={styles.logoTopContainer}>
            <PrudencyLogo size="md" />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Crée ton espace !</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputsContainer}>
              <Input
                label="E-mail *"
                placeholder="exemple@gmail.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                variant="dark"
              />

              <Input
                label="Mot de passe *"
                placeholder="************"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={errors.password}
                secureTextEntry
                secureToggle
                variant="dark"
              />

              {/* Forgot password link */}
              <Pressable
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
              </Pressable>
            </View>

            {/* CGU checkbox */}
            <Pressable
              style={styles.cguRow}
              onPress={() => setAcceptedCgu((prev) => !prev)}
            >
              <View style={[styles.checkbox, acceptedCgu && styles.checkboxChecked]}>
                {acceptedCgu && (
                  <Ionicons name="checkmark" size={scaledIcon(14)} color={colors.white} />
                )}
              </View>
              <Text style={styles.cguText}>
                {"J'accepte les "}
                <Text
                  style={styles.cguLink}
                  onPress={() => Linking.openURL(CGU_URL)}
                >
                  Conditions Générales d'Utilisation
                </Text>
                {" et la "}
                <Text
                  style={styles.cguLink}
                  onPress={() => Linking.openURL(PRIVACY_URL)}
                >
                  Politique de confidentialité
                </Text>
              </Text>
            </Pressable>

            {errors.submit && (
              <Text style={styles.errorText}>{errors.submit}</Text>
            )}

            {/* Register button */}
            <Button
              title="M'inscrire"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              disabled={!isFormValid}
            />

            {/* Login link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>
                Tu as déjà un compte ?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Text style={styles.loginLinkAction}>Connecte-toi !</Text>
              </Link>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <Button
              title="Continuer avec Google"
              variant="social"
              onPress={handleGoogleSignIn}
              loading={isGoogleLoading}
              disabled={isSocialLoading}
              fullWidth
              icon={<GoogleLogo size={20} />}
            />

            {/* Apple Sign In (iOS only) */}
            {Platform.OS === 'ios' && (
              <Button
                title="Continuer avec Apple"
                variant="social"
                onPress={handleAppleSignIn}
                loading={isAppleLoading}
                disabled={isSocialLoading}
                fullWidth
                icon={<AppleLogo size={20} />}
              />
            )}

            {/* Facebook — coming soon */}
            <View>
              <Button
                title="Continuer avec Facebook"
                variant="social"
                onPress={() => {}}
                disabled
                fullWidth
                icon={<FacebookLogo size={20} color={colors.gray[400]} />}
              />
              <Text style={styles.comingSoonText}>Bientôt disponible</Text>
            </View>
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
    paddingBottom: scaledSpacing(24),
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(16),
  },
  title: {
    ...typography.h2,
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(8),
  },
  subtitle: {
    ...typography.body,
    color: colors.primary[50],
    textAlign: 'center',
  },
  form: {
    flex: 1,
    gap: scaledSpacing(16),
  },
  inputsContainer: {
    gap: 0,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPassword: {
    ...typography.link,
    color: colors.primary[50],
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[400],
    textAlign: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    ...typography.bodySmall,
    color: colors.primary[50],
    letterSpacing: -0.32,
  },
  loginLinkAction: {
    ...typography.bodySmall,
    color: colors.primary[50],
    fontFamily: typography.link.fontFamily,
    fontWeight: '600',
    textDecorationLine: 'underline',
    letterSpacing: -0.32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary[50],
    opacity: 0.3,
  },
  dividerText: {
    ...typography.body,
    color: colors.primary[50],
    marginHorizontal: scaledSpacing(16),
  },
  logoTopContainer: {
    alignItems: 'center',
    marginBottom: scaledSpacing(16),
  },
  cguRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scaledSpacing(10),
  },
  checkbox: {
    width: scaledSpacing(20),
    height: scaledSpacing(20),
    borderRadius: scaledSpacing(4),
    borderWidth: 1.5,
    borderColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaledSpacing(2),
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  cguText: {
    ...typography.caption,
    color: colors.primary[50],
    flex: 1,
  },
  cguLink: {
    textDecorationLine: 'underline' as const,
  },
  comingSoonText: {
    ...typography.caption,
    color: colors.gray[400],
    textAlign: 'center' as const,
    marginTop: scaledSpacing(4),
  },
});
