import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c !== '') && newCode.join('').length === CODE_LENGTH) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Placeholder: will verify OTP via Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (fullCode === '123456') {
        router.replace('/(auth)/onboarding');
      } else {
        setError('Code incorrect. Veuillez reessayer.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setResendTimer(60);
    // Placeholder: resend OTP
  };

  const maskedPhone = phone
    ? phone.replace(/(\+\d{2})(\d{1})(\d+)(\d{2})/, '$1 $2** *** **$4')
    : '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          Entrez le code envoye au {maskedPhone}
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Vous n'avez pas recu le code ?</Text>
          <Pressable onPress={handleResend} disabled={resendTimer > 0}>
            <Text
              style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled,
              ]}
            >
              {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer'}
            </Text>
          </Pressable>
        </View>

        <Button
          title="Verifier"
          onPress={() => handleVerify(code.join(''))}
          loading={isLoading}
          disabled={code.some((c) => !c) || isLoading}
          fullWidth
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[20],
  },
  title: {
    ...typography.h1,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing[10],
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[900],
  },
  codeInputFilled: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  codeInputError: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  error: {
    ...typography.bodySmall,
    color: colors.error[600],
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  resendText: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginBottom: spacing[1],
  },
  resendLink: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.gray[400],
  },
  button: {
    marginTop: 'auto',
    marginBottom: spacing[8],
  },
});
