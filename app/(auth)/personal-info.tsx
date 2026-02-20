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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuth } from '@/src/hooks/useAuth';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

/**
 * Inscription/Demande des infos - Personal information form
 * Collects: Prénom*, Nom, Téléphone*
 * With CGU acceptance checkbox
 * Uses native autofill for better UX (as per Figma notes)
 */
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

    if (!phone.trim()) {
      newErrors.phone = 'Ajoute ton numéro pour sécuriser ton compte.';
    } else if (!/^(\+33|0)[1-9](\d{8})$/.test(phone.replace(/\s/g, ''))) {
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
      const cleanPhone = phone.replace(/\s/g, '');
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone: cleanPhone,
      });

      router.push({
        pathname: '/(auth)/verify-phone',
        params: { phone: cleanPhone },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('phone_already_exists') || message.includes('duplicate')) {
        setErrors({ phone: 'Ce numéro est déjà associé à un compte.' });
      } else {
        setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() !== '' && phone.trim() !== '' && acceptedTerms;

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
              autoComplete="given-name"
              textContentType="givenName"
              variant="dark"
            />

            <Input
              label="Nom"
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              variant="dark"
            />

            <Input
              label="Téléphone *"
              placeholder="0651872510"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              variant="dark"
            />

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
  },
  form: {
    flex: 1,
    gap: scaledSpacing(16),
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scaledSpacing(12),
    marginTop: scaledSpacing(8),
  },
  checkbox: {
    width: ms(24, 0.5),
    height: ms(24, 0.5),
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaledSpacing(2),
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    flex: 1,
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    lineHeight: scaledLineHeight(20),
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: scaledFontSize(12),
    color: colors.error[400],
    marginTop: scaledSpacing(-8),
  },
  buttonContainer: {
    marginTop: scaledSpacing(24),
  },
  logoTopContainer: {
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
});
