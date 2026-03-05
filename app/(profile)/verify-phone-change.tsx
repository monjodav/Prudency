import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '@/src/theme/colors';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Button } from '@/src/components/ui/Button';
import { sendOtp, verifyOtp } from '@/src/services/otpService';
import { updateProfile } from '@/src/services/authService';
import { toE164 } from '@/src/utils/phoneUtils';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, ms } from '@/src/utils/scaling';

const CODE_LENGTH = 6;

export default function VerifyPhoneChangeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) {
      const newCode = [...code];
      for (let i = 0; i < CODE_LENGTH; i++) {
        newCode[i] = digits[i] ?? '';
      }
      setCode(newCode);
      setError(null);
      const focusIndex = Math.min(digits.length, CODE_LENGTH) - 1;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = digits;
    setCode(newCode);
    setError(null);

    if (digits && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!phone) {
      setError('Numéro de téléphone manquant.');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError('Renseigne le code complet reçu par SMS.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const verified = await verifyOtp(phone, fullCode);

      if (!verified) {
        setError('Le code saisi est incorrect. Vérifie-le et réessaie.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      await updateProfile({ phone, phone_verified: true });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.dismiss(2);
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

  const isCodeComplete = code.every((c) => c !== '');

  return (
    <DarkScreen scrollable avoidKeyboard headerTitle="Vérification">
      <View style={styles.header}>
        <Text style={styles.title}>Vérifie ton numéro</Text>
        <Text style={styles.subtitle}>
          Un code a été envoyé au : {phone ?? ''}{'\n'}
          Tu as {resendTimer}s pour rentrer le code.
        </Text>
      </View>

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
            onChangeText={(val) => handleCodeChange(index, val)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={index === 0 ? CODE_LENGTH : 1}
            selectTextOnFocus
            autoFocus={index === 0}
            placeholder="_"
            placeholderTextColor={colors.gray[500]}
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'sms-otp' : 'off'}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

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

      <Button
        title="Confirmer"
        onPress={handleVerify}
        loading={isLoading}
        disabled={!isCodeComplete || isLoading}
        fullWidth
      />
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
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
});
