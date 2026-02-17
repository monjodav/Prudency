import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, ms } from '@/src/utils/scaling';

const CODE_LENGTH = 6;

// TODO: SECURITY - Replace with server-side OTP verification via Edge Function
// This is a development placeholder only. In production:
// 1. Generate OTP server-side and store with expiry
// 2. Send via Plivo SMS
// 3. Verify server-side, not client-side
const DEV_BYPASS_OTP = __DEV__ ? '123456' : null;

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
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError('Renseigne le code complet reçu par SMS.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with server-side verification call
      // const { verified } = await verifyOTP(phone, fullCode);

      // Development bypass - only works in __DEV__ mode
      const isValidCode = DEV_BYPASS_OTP && fullCode === DEV_BYPASS_OTP;

      if (!isValidCode) {
        setError('Le code saisi est incorrect. Vérifie-le et réessaie.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      router.replace('/(auth)/permissions-location');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('expired') || message.includes('code_expired')) {
        setError('Ce code a expiré. Demande-en un nouveau.');
      } else if (message.includes('too_many_attempts') || message.includes('rate_limit')) {
        setError('Trop de tentatives. Réessaie dans quelques minutes.');
      } else {
        setError("Un souci est survenu lors de l'envoi du code. Réessaie dans un instant.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setError(null);
    try {
      // Placeholder: resend OTP via Edge Function + Plivo
    } catch {
      setError("Un souci est survenu lors de l'envoi du code. Réessaie dans un instant.");
    }
  };

  const displayPhone = phone || '+33 6 51 87 25 10';
  const isCodeComplete = code.every((c) => c !== '');

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
            <Text style={styles.title}>Vérifie ton numéro</Text>
            <Text style={styles.subtitle}>
              Je t'ai envoyé un code au : {displayPhone}{'\n'}
              Tu as {resendTimer}s pour rentrer le code.
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
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
                placeholder="_"
                placeholderTextColor={colors.gray[500]}
              />
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Resend link */}
          <Pressable onPress={handleResend} disabled={resendTimer > 0}>
            <Text
              style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled,
              ]}
            >
              Recevoir un nouveau code
            </Text>
          </Pressable>

          <View style={styles.spacer} />

          {/* Submit button */}
          <Button
            title="Commencer"
            onPress={handleVerify}
            loading={isLoading}
            disabled={!isCodeComplete || isLoading}
            fullWidth
          />

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
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(8),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(22),
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaledSpacing(8),
    marginTop: scaledSpacing(24),
    marginBottom: scaledSpacing(16),
  },
  codeInput: {
    width: ms(32, 0.5),
    height: ms(48, 0.5),
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(8),
    textAlign: 'center',
    fontSize: scaledFontSize(18),
    fontWeight: '400',
    color: colors.white,
    backgroundColor: 'transparent',
  },
  codeInputFilled: {
    borderColor: colors.primary[400],
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
  },
  codeInputError: {
    borderColor: colors.error[500],
  },
  error: {
    fontSize: scaledFontSize(14),
    color: colors.error[400],
    textAlign: 'center',
    marginBottom: scaledSpacing(16),
  },
  resendLink: {
    fontSize: scaledFontSize(14),
    fontWeight: '600',
    color: colors.primary[50],
    textAlign: 'center',
  },
  resendLinkDisabled: {
    opacity: 0.5,
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
