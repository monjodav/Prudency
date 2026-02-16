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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuth } from '@/src/hooks/useAuth';
import { useSocialAuth } from '@/src/hooks/useSocialAuth';
import { AuthError } from '@supabase/supabase-js';
import { scaledSpacing, scaledFontSize, scaledIcon, ms } from '@/src/utils/scaling';

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!password) {
      newErrors.password = 'Mot de passe requis';
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
          setErrors({ submit: 'Email ou mot de passe incorrect' });
        } else if (err.message.includes('Email not confirmed')) {
          setErrors({ submit: 'Vérifie ton email avant de te connecter' });
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Bon retour parmi nous !</Text>
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
                Tu n'as pas encore de compte ?{'\n'}
                <Link href="/(auth)/register" asChild>
                  <Text style={styles.registerLinkAction}>Inscris-toi !</Text>
                </Link>
              </Text>
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
              icon={
                <Ionicons name="logo-google" size={scaledIcon(20)} color={colors.gray[950]} />
              }
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
                icon={
                  <Ionicons name="logo-apple" size={scaledIcon(20)} color={colors.gray[950]} />
                }
              />
            )}
          </View>

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
    paddingTop: scaledSpacing(100),
    paddingBottom: scaledSpacing(40),
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50], // #e8eaf8
    textAlign: 'center',
    marginBottom: scaledSpacing(8),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50], // #e8eaf8
    textAlign: 'center',
  },
  form: {
    flex: 1,
    gap: scaledSpacing(24),
  },
  inputsContainer: {
    gap: scaledSpacing(16),
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: scaledSpacing(8),
  },
  forgotPassword: {
    fontSize: scaledFontSize(14),
    fontWeight: '600',
    color: colors.primary[50], // #e8eaf8
    textAlign: 'center',
  },
  errorText: {
    fontSize: scaledFontSize(14),
    color: colors.error[400],
    textAlign: 'center',
  },
  registerLinkContainer: {
    alignItems: 'center',
    marginTop: scaledSpacing(8),
  },
  registerLinkText: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    color: colors.primary[50], // #e8eaf8
    textAlign: 'center',
    fontFamily: 'Kalam_400Regular',
  },
  registerLinkAction: {
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scaledSpacing(8),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary[50],
    opacity: 0.3,
  },
  dividerText: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    color: colors.primary[50],
    marginHorizontal: scaledSpacing(16),
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
