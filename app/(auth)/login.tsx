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
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius, shadows } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    // Placeholder: will be connected to useAuth hook
    setTimeout(() => setLoading(false), 1000);
  };

  const handleAppleLogin = async () => {
    // Placeholder: Apple Sign In
  };

  const handleGoogleLogin = async () => {
    // Placeholder: Google Sign In
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appName}>Prudency</Text>
          <Text style={styles.tagline}>Securite des trajets</Text>
        </View>

        <View style={styles.socialButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              styles.appleButton,
              pressed && styles.socialPressed,
            ]}
            onPress={handleAppleLogin}
          >
            <FontAwesome name="apple" size={20} color={colors.white} />
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>
              Continuer avec Apple
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              styles.googleButton,
              pressed && styles.socialPressed,
            ]}
            onPress={handleGoogleLogin}
          >
            <FontAwesome name="google" size={20} color={colors.gray[700]} />
            <Text style={[styles.socialButtonText, styles.googleButtonText]}>
              Continuer avec Google
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Email"
          placeholder="votre@email.fr"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          placeholder="Votre mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          secureToggle
          autoComplete="password"
        />

        <Button
          title="Se connecter"
          onPress={handleEmailLogin}
          loading={loading}
          fullWidth
          disabled={!email || !password}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.linkText}>Creer un compte</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing[20],
    paddingBottom: spacing[10],
  },
  appName: {
    ...typography.h1,
    color: colors.primary[500],
  },
  tagline: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing[2],
  },
  socialButtons: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[3],
  },
  socialPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  appleButton: {
    backgroundColor: colors.black,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  socialButtonText: {
    ...typography.button,
  },
  appleButtonText: {
    color: colors.white,
  },
  googleButtonText: {
    color: colors.gray[700],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.gray[400],
    paddingHorizontal: spacing[4],
  },
  errorBox: {
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[600],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  footerText: {
    ...typography.body,
    color: colors.gray[600],
  },
  linkText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
