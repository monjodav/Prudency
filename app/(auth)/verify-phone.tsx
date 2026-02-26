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
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { sendOtp, verifyOtp } from '@/src/services/otpService';
import { toE164 } from '@/src/utils/phoneUtils';
import { useAuth } from '@/src/hooks/useAuth';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, ms } from '@/src/utils/scaling';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const { phone: rawPhone } = useLocalSearchParams<{ phone: string }>();
  const phone = rawPhone ? toE164(rawPhone) : undefined;
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
      const verified = await verifyOtp(phone!, fullCode);

      if (!verified) {
        setError('Le code saisi est incorrect. Vérifie-le et réessaie.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      router.replace('/(auth)/permissions-location');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('code_expired')) {
        setError('Ce code a expiré. Demande-en un nouveau.');
      } else if (message.includes('too_many_attempts')) {
        setError('Trop de tentatives. Réessaie dans quelques minutes.');
      } else {
        setError("Un souci est survenu lors de la vérification. Réessaie dans un instant.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    setResendTimer(60);
    setError(null);
    try {
      await sendOtp(phone);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('too_many_requests')) {
        setError('Trop de demandes. Réessaie dans quelques minutes.');
      } else {
        setError("Un souci est survenu lors de l'envoi du code. Réessaie dans un instant.");
      }
    }
  };

  const displayPhone = phone || '';
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
          {/* Logo */}
          <View style={styles.logoTopContainer}>
            <PrudencyLogo size="md" />
          </View>

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

          {/* TODO: retirer quand le service OVH SMS standard sera prêt */}
          <Pressable
            style={styles.skipButton}
            onPress={async () => {
              await updateProfile({ phone_verified: true });
              router.replace('/(auth)/permissions-location');
            }}
          >
            <Text style={styles.skipText}>Passer cette étape</Text>
          </Pressable>

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
  logoTopContainer: {
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  skipButton: {
    marginTop: scaledSpacing(16),
    alignItems: 'center',
  },
  skipText: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.gray[400],
    textDecorationLine: 'underline',
  },
});
