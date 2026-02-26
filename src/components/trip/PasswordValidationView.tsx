import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { scaledIcon } from '@/src/utils/scaling';
import { verifyPassword } from '@/src/services/authService';

type PasswordValidationViewProps = {
  isBiometricAvailable: boolean;
  onBiometricValidation: () => void;
  onPasswordValidation: () => void;
  isCompleting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
};

export function PasswordValidationView({
  isBiometricAvailable,
  onBiometricValidation,
  onPasswordValidation,
  isCompleting,
  error,
  setError,
}: PasswordValidationViewProps) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const valid = await verifyPassword(password);
      if (!valid) {
        setError('Mot de passe incorrect.');
        return;
      }
      await onPasswordValidation();
    } catch {
      setError('Erreur de vérification. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.validationContent}>
        <View style={styles.validationIconContainer}>
          <Ionicons
            name="shield-checkmark"
            size={scaledIcon(64)}
            color={colors.primary[400]}
          />
        </View>

        <Text style={styles.validationTitle}>Trajet termine</Text>

        {isBiometricAvailable ? (
          <BiometricFirstView
            onBiometricValidation={onBiometricValidation}
            isCompleting={isCompleting}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onPasswordSubmit={handlePasswordSubmit}
            isVerifying={isVerifying}
            error={error}
          />
        ) : (
          <PasswordOnlyView
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onPasswordSubmit={handlePasswordSubmit}
            isVerifying={isVerifying}
            error={error}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function BiometricFirstView({
  onBiometricValidation,
  isCompleting,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onPasswordSubmit,
  isVerifying,
  error,
}: {
  onBiometricValidation: () => void;
  isCompleting: boolean;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onPasswordSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  return (
    <View style={styles.validationBody}>
      <Text style={styles.validationSubtitle}>
        Valide avec la biometrie pour confirmer ton arrivee.
      </Text>

      <Button
        title="Verifier avec la biometrie"
        onPress={onBiometricValidation}
        loading={isCompleting}
        fullWidth
        size="lg"
        icon={<Ionicons name="finger-print" size={scaledIcon(20)} color={colors.white} />}
      />

      {!showPasswordInput ? (
        <Pressable
          style={styles.passwordLink}
          onPress={() => setShowPasswordInput(true)}
        >
          <Text style={styles.passwordLinkText}>
            Ou utilise ton mot de passe
          </Text>
        </Pressable>
      ) : (
        <PasswordInput
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onSubmit={onPasswordSubmit}
          isVerifying={isVerifying}
          error={error}
        />
      )}
    </View>
  );
}

function PasswordOnlyView({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onPasswordSubmit,
  isVerifying,
  error,
}: {
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onPasswordSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  return (
    <View style={styles.validationBody}>
      <Text style={styles.validationSubtitle}>
        Valide avec ton mot de passe pour confirmer ton arrivee.
      </Text>

      <PasswordInput
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={onPasswordSubmit}
        isVerifying={isVerifying}
        error={error}
      />
    </View>
  );
}

function PasswordInput({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmit,
  isVerifying,
  error,
}: {
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  return (
    <View style={styles.passwordSection}>
      <Text style={styles.passwordLabel}>Mot de passe</Text>
      <View style={styles.passwordInputRow}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor={colors.gray[500]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Pressable
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={scaledIcon(20)}
            color={colors.gray[400]}
          />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scaledIcon(14)} color={colors.error[400]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title="Valider"
        onPress={onSubmit}
        loading={isVerifying}
        fullWidth
        size="lg"
        style={styles.passwordSubmitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  validationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  validationIconContainer: {
    marginBottom: spacing[6],
  },
  validationTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  validationSubtitle: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  validationBody: {
    width: '100%',
    alignItems: 'center',
  },
  passwordLink: {
    paddingVertical: spacing[4],
  },
  passwordLinkText: {
    ...typography.bodySmall,
    color: colors.primary[300],
    fontWeight: '500',
  },
  passwordSection: {
    width: '100%',
    marginTop: spacing[6],
  },
  passwordLabel: {
    ...typography.label,
    color: colors.gray[300],
    marginBottom: spacing[2],
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  passwordInput: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  passwordToggle: {
    padding: spacing[3],
  },
  passwordSubmitButton: {
    marginTop: spacing[4],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  errorText: {
    ...typography.caption,
    color: colors.error[400],
  },
});
