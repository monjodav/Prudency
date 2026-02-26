import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuth } from '@/src/hooks/useAuth';
// TODO: réactiver quand le service OVH SMS standard sera prêt
// import { sendOtp } from '@/src/services/otpService';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { scaledSpacing, scaledFontSize, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

const COUNTRY_PREFIX = '+33';

/** Format digits as "X XX XX XX XX" for display */
function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 1));
  if (digits.length > 1) parts.push(digits.slice(1, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(' ');
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Ajoute ton prénom';
    }

    const digits = phone.replace(/[\s.\-()]/g, '');
    if (!digits) {
      newErrors.phone = 'Ajoute ton numéro pour sécuriser ton compte.';
    } else if (!/^0?[1-9]\d{8}$/.test(digits)) {
      newErrors.phone = 'Ce numéro ne semble pas valide.';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Tu dois accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const digits = phone.replace(/[\s.\-()]/g, '').replace(/^0/, '');
      const e164Phone = `${COUNTRY_PREFIX}${digits}`;
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone: e164Phone,
        phone_verified: true,
      });

      // TODO: réactiver sendOtp quand le service OVH SMS standard sera prêt
      // await sendOtp(e164Phone);
      // router.push({ pathname: '/(auth)/verify-phone', params: { phone: e164Phone } });

      router.replace('/(auth)/permissions-location');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('phone_already_exists') || message.includes('duplicate')) {
        setErrors({ phone: 'Ce numéro est déjà associé à un compte.' });
      } else if (message.includes('too_many_requests')) {
        setErrors({ submit: 'Trop de tentatives. Réessaie dans quelques minutes.' });
      } else {
        setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() !== '' && phone.replace(/[\s.\-()]/g, '').length > 0 && acceptedTerms;

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
          {/* Logo — positioned at top with spacing */}
          <View style={styles.logoTopContainer}>
            <PrudencyLogo size="md" />
          </View>

          {/* Spacer pushes content to bottom */}
          <View style={styles.spacer} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tes informations</Text>
            <Text style={styles.subtitle}>Remplis tes informations.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Prénom *"
              placeholder="Léa"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
              }}
              error={errors.firstName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="given-name"
              textContentType="givenName"
              variant="dark"
              containerStyle={styles.inputNoMargin}
            />

            <Input
              label="Nom"
              placeholder="Dupont"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="family-name"
              textContentType="familyName"
              variant="dark"
              containerStyle={styles.inputNoMargin}
            />

            <View style={styles.phoneFieldContainer}>
              <Text style={styles.phoneLabel}>Téléphone *</Text>
              <View style={[
                styles.phoneRow,
                errors.phone ? styles.phoneRowError : undefined,
              ]}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixFlag}>🇫🇷</Text>
                  <Text style={styles.phonePrefixCode}>{COUNTRY_PREFIX}</Text>
                </View>
                <View style={styles.phoneSeparator} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="6 12 34 56 78"
                  placeholderTextColor={colors.gray[500]}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(formatPhoneDisplay(text));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  maxLength={13}
                />
              </View>
              {errors.phone && <Text style={styles.phoneError}>{errors.phone}</Text>}
            </View>

            {/* Terms checkbox */}
            <Pressable
              style={styles.termsContainer}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={scaledIcon(14)} color={colors.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                J'accepte les{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Page en construction')}
                >
                  Conditions générales
                </Text>
                {' '}et la{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => Alert.alert('Page en construction')}
                >
                  Politique de confidentialité
                </Text>.
              </Text>
            </Pressable>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
            {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}

            {/* Submit button */}
            <View style={styles.buttonContainer}>
              <Button
                title="M'inscrire"
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                disabled={!isFormValid}
              />
            </View>
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
    paddingHorizontal: 64,
    paddingTop: scaledSpacing(110),
    paddingBottom: scaledSpacing(71),
  },
  spacer: {
    flex: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(16),
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
  },
  form: {
    gap: scaledSpacing(16),
  },
  inputNoMargin: {
    marginBottom: 0,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: '#f6f6f6',
    lineHeight: 16,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  phoneFieldContainer: {
    gap: scaledSpacing(8),
  },
  phoneLabel: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(8),
    height: ms(48, 0.5),
    paddingHorizontal: scaledSpacing(12),
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
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.white,
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
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    height: '100%',
    paddingVertical: 0,
  },
  phoneError: {
    fontSize: scaledFontSize(12),
    color: colors.error[500],
  },
  errorText: {
    fontSize: scaledFontSize(12),
    color: colors.error[400],
    marginTop: scaledSpacing(-16),
  },
  buttonContainer: {
    paddingTop: scaledSpacing(24),
  },
  logoTopContainer: {
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
});
