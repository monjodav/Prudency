import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { passwordSchema } from '@/src/utils/validators';
import * as authService from '@/src/services/authService';
import {
  scaledSpacing,
  scaledFontSize,
  scaledLineHeight,
  scaledRadius,
  scaledIcon,
  ms,
} from '@/src/utils/scaling';

interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function checkPasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function CriteriaRow({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={styles.criteriaRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={scaledIcon(16)}
        color={met ? colors.success[400] : colors.gray[400]}
      />
      <Text style={[styles.criteriaText, met && styles.criteriaTextMet]}>
        {label}
      </Text>
    </View>
  );
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criteria = checkPasswordCriteria(password);
  const allCriteriaMet = Object.values(criteria).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleUpdatePassword = async () => {
    setError(null);

    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setError(firstIssue?.message ?? 'Mot de passe invalide.');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <OnboardingBackground>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={scaledIcon(64)}
                color={colors.success[400]}
              />
            </View>
            <Text style={styles.title}>Mot de passe modifie</Text>
            <Text style={styles.subtitle}>
              Ton mot de passe a ete mis a jour avec succes. Tu peux maintenant
              te connecter avec ton nouveau mot de passe.
            </Text>
          </View>

          <View style={styles.spacer} />

          <Button
            title="Retour a la connexion"
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={scaledIcon(48)}
                color={colors.primary[50]}
              />
            </View>
            <Text style={styles.title}>Nouveau mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisis un nouveau mot de passe securise pour ton compte.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nouveau mot de passe *"
              placeholder="************"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              secureTextEntry
              secureToggle
              variant="dark"
            />

            <View style={styles.criteriaContainer}>
              <CriteriaRow met={criteria.minLength} label="8 caracteres minimum" />
              <CriteriaRow met={criteria.hasUppercase} label="Une majuscule" />
              <CriteriaRow met={criteria.hasLowercase} label="Une minuscule" />
              <CriteriaRow met={criteria.hasNumber} label="Un chiffre" />
              <CriteriaRow met={criteria.hasSpecial} label="Un caractere special" />
            </View>

            <Input
              label="Confirmer le mot de passe *"
              placeholder="************"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) setError(null);
              }}
              error={
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'Les mots de passe ne correspondent pas.'
                  : undefined
              }
              secureTextEntry
              secureToggle
              variant="dark"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Valider"
              onPress={handleUpdatePassword}
              loading={loading}
              fullWidth
              disabled={!allCriteriaMet || !passwordsMatch}
            />
          </View>

          <View style={styles.spacer} />

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
    paddingTop: scaledSpacing(80),
    paddingBottom: scaledSpacing(40),
  },
  centered: {
    alignItems: 'center',
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
    gap: scaledSpacing(16),
  },
  criteriaContainer: {
    gap: scaledSpacing(6),
    marginTop: scaledSpacing(-8),
    marginBottom: scaledSpacing(8),
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSpacing(8),
  },
  criteriaText: {
    fontSize: scaledFontSize(13),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[400],
  },
  criteriaTextMet: {
    color: colors.success[400],
  },
  errorText: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    color: colors.error[400],
    textAlign: 'center',
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
