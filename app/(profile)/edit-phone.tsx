import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { getProfile } from '@/src/services/authService';
import { checkPhoneAvailability } from '@/src/services/phoneService';
import { sendOtp } from '@/src/services/otpService';
import { toE164 } from '@/src/utils/phoneUtils';
import {
  scaledIcon,
  scaledSpacing,
  scaledFontSize,
  scaledRadius,
  ms,
} from '@/src/utils/scaling';

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 1));
  if (digits.length > 1) parts.push(digits.slice(1, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(' ');
}

function rawDigits(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export default function EditPhoneScreen() {
  const router = useRouter();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const currentPhone = profile?.phone ?? '';
  const currentDigits = currentPhone.replace(/^\+33/, '');

  const [phoneInput, setPhoneInput] = useState(
    currentDigits ? formatPhoneDisplay(currentDigits) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleChangeText = (text: string) => {
    setError(null);
    const digits = rawDigits(text).slice(0, 9);
    setPhoneInput(formatPhoneDisplay(digits));
  };

  const handleValidate = async () => {
    if (isLoading) return;

    const digits = rawDigits(phoneInput);
    if (digits.length !== 9) {
      setError('Numéro invalide. Entre les 9 chiffres après +33.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const e164 = `+33${digits}`;

      // Same number → just go back
      if (e164 === currentPhone) {
        router.back();
        return;
      }

      const available = await checkPhoneAvailability(e164);
      if (!available) {
        setError('Ce numéro est déjà associé à un compte.');
        setIsLoading(false);
        return;
      }

      await sendOtp(e164);
      router.push({
        pathname: '/(profile)/verify-phone-change',
        params: { phone: digits },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('too_many_requests')) {
        setError('Trop de demandes. Réessaie dans quelques minutes.');
      } else {
        setError("Un souci est survenu. Réessaie dans un instant.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DarkScreen
      avoidKeyboard
      headerTitle="Téléphone"
      headerLeft={
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
      }
      headerRight={
        <Pressable
          onPress={handleValidate}
          hitSlop={12}
          disabled={isLoading}
          style={styles.headerButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.brandPosition[50]} />
          ) : (
            <Ionicons name="checkmark" size={scaledIcon(24)} color={colors.brandPosition[50]} />
          )}
        </Pressable>
      }
    >
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Téléphone</Text>
        <View style={[styles.phoneRow, error && styles.phoneRowError]}>
          <View style={styles.phonePrefix}>
            <Text style={styles.phonePrefixFlag}>{'\u{1F1EB}\u{1F1F7}'}</Text>
            <Text style={styles.phonePrefixCode}>+33</Text>
          </View>
          <View style={styles.phoneSeparator} />
          <TextInput
            style={styles.phoneInput}
            value={phoneInput}
            onChangeText={handleChangeText}
            keyboardType="phone-pad"
            placeholder="6 12 34 56 78"
            placeholderTextColor={colors.gray[500]}
            autoFocus
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.hint}>
          Tu devras confirmer ton numéro de téléphone via un code qui te sera envoyé par message.
        </Text>
      </View>
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: scaledIcon(32),
    height: scaledIcon(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    gap: scaledSpacing(8),
  },
  label: {
    ...typography.label,
    color: colors.gray[50],
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(8),
    minHeight: ms(48, 0.5),
    paddingHorizontal: scaledSpacing(12),
    paddingVertical: scaledSpacing(10),
  },
  phoneRowError: {
    borderColor: colors.error[600],
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSpacing(6),
  },
  phonePrefixFlag: {
    fontSize: scaledFontSize(18),
  },
  phonePrefixCode: {
    fontSize: scaledFontSize(16),
    fontFamily: 'Inter_400Regular',
    color: colors.button.disabledText,
  },
  phoneSeparator: {
    width: 1,
    height: ms(24, 0.5),
    backgroundColor: colors.primary[200],
    marginHorizontal: scaledSpacing(10),
  },
  phoneInput: {
    flex: 1,
    fontSize: scaledFontSize(16),
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
  },
  hint: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[1],
  },
});
