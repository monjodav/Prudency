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
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { Modal } from '@/src/components/ui/Modal';
import { useAuth } from '@/src/hooks/useAuth';
import { useSocialAuth } from '@/src/hooks/useSocialAuth';
import { AuthError } from '@supabase/supabase-js';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { GoogleLogo } from '@/src/components/icons/GoogleLogo';
import { AppleLogo } from '@/src/components/icons/AppleLogo';
import { FacebookLogo } from '@/src/components/icons/FacebookLogo';
import { scaledSpacing } from '@/src/utils/scaling';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
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
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Ajoute ton adresse email pour continuer.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Cette adresse email ne semble pas valide.';
    }
    if (!password) {
      newErrors.password = 'Saisi ton mot de passe';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      // Navigation handled automatically by AuthGate in _layout.tsx
      // when session state changes
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.message.includes('Invalid login credentials')) {
          setErrors({ password: 'Ton mot de passe est invalide' });
        } else if (err.message.includes('user_not_found') || err.message.includes('User not found')) {
          setShowDeletedModal(true);
        } else {
          setErrors({ submit: err.message });
        }
      } else {
        setErrors({ submit: 'Impossible de se connecter pour le moment. Vérifie ta connexion.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert('Erreur', 'La connexion avec Google a échoué.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch {
      Alert.alert('Erreur', 'La connexion avec Apple a échoué.');
    }
  };

  const isFormValid = email.trim() !== '' && password !== '';

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
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Accède à ton espace</Text>
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

            {errors.submit && (
              <Text style={styles.errorText}>{errors.submit}</Text>
            )}

            {/* Login button */}
            <Button
              title="Me connecter"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              disabled={!isFormValid}
            />

            {/* Register link */}
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>
                Tu n'as pas encore de compte ?{' '}
              </Text>
              <Link href="/(auth)/register" asChild>
                <Text style={styles.registerLinkAction}>Inscris-toi !</Text>
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
              onPress={handleGoogleLogin}
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
                onPress={handleAppleLogin}
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

      <Modal
        visible={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        title="Compte supprimé"
      >
        <Text style={styles.modalText}>
          Ce compte n'existe plus. Tu peux en créer un nouveau.
        </Text>
        <Button
          title="Ok"
          onPress={() => setShowDeletedModal(false)}
          fullWidth
        />
      </Modal>
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
    alignItems: 'flex-end',
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
  registerLinkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLinkText: {
    ...typography.bodySmall,
    color: colors.primary[50],
    letterSpacing: -0.32,
  },
  registerLinkAction: {
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
  modalText: {
    ...typography.body,
    color: colors.gray[700],
    marginBottom: scaledSpacing(24),
  },
  comingSoonText: {
    ...typography.caption,
    color: colors.gray[400],
    textAlign: 'center' as const,
    marginTop: scaledSpacing(4),
  },
});
