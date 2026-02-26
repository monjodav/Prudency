import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useContacts } from '@/src/hooks/useContacts';
import { useAuth } from '@/src/hooks/useAuth';
import { createContactSchema } from '@/src/utils/validators';
import { toE164 } from '@/src/utils/phoneUtils';
import { scaledSpacing, scaledFontSize, scaledIcon } from '@/src/utils/scaling';

export default function AddContactFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createContact } = useContacts();
  const { updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildContactData = () => {
    const cleanPhone = toE164(phone.replace(/[\s.\-()]/g, ''));
    return {
      name: `${firstName.trim()} ${lastName.trim()}`,
      phone: cleanPhone,
      isPrimary: true,
    };
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Prénom requis';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Numéro de téléphone requis';
      setErrors(newErrors);
      return false;
    }

    try {
      const data = buildContactData();
      createContactSchema.parse(data);
    } catch {
      if (!newErrors.phone) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImportContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Autorise l\'accès aux contacts pour importer facilement.'
        );
        return;
      }

      const contact = await Contacts.presentContactPickerAsync();

      if (contact) {
        setFirstName(contact.firstName || '');
        setLastName(contact.lastName || '');
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const firstPhone = contact.phoneNumbers[0];
          if (firstPhone?.number) {
            setPhone(firstPhone.number);
          }
        }
      }
    } catch {
      Alert.alert(
        'Erreur',
        'Impossible d\'importer le contact. Veuillez réessayer ou saisir manuellement.'
      );
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
    } catch {
      // Non-blocking: profile update failure should not prevent navigation
    }
    router.replace('/(tabs)');
  };

  const handleSaveContact = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createContact(buildContactData());
      await completeOnboarding();
    } catch {
      setErrors({ submit: 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && phone.trim() !== '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + scaledSpacing(16) }]}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Ionicons name="chevron-back" size={scaledIcon(26)} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Ajouter une personne de confiance</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Prénom"
              placeholder="Léa"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
              }}
              error={errors.firstName}
              autoCapitalize="words"
              variant="dark"
            />

            <Input
              label="Nom *"
              placeholder="Karili"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
              }}
              error={errors.lastName}
              autoCapitalize="words"
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
              variant="dark"
            />

            {/* Import contact button */}
            <Button
              title="Importer un contact"
              variant="outline"
              onPress={handleImportContact}
              fullWidth
              icon={<Ionicons name="download-outline" size={scaledIcon(24)} color={colors.white} />}
              iconPosition="right"
            />
          </View>

          {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}
        </ScrollView>

        {/* Submit button pinned at bottom */}
        <View style={[styles.bottomButton, { paddingBottom: insets.bottom + scaledSpacing(24) }]}>
          <Button
            title="Envoyé une demande"
            onPress={handleSaveContact}
            loading={loading}
            fullWidth
            disabled={!isFormValid}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaledSpacing(16),
    paddingBottom: scaledSpacing(16),
    backgroundColor: colors.primary[950],
    gap: scaledSpacing(8),
  },
  backButton: {
    width: scaledSpacing(40),
    height: scaledSpacing(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: scaledFontSize(16),
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaledSpacing(24),
    paddingTop: scaledSpacing(80),
  },
  form: {
    gap: scaledSpacing(16),
  },
  errorText: {
    fontSize: scaledFontSize(14),
    color: colors.error[400],
    textAlign: 'center',
    marginTop: scaledSpacing(16),
  },
  bottomButton: {
    paddingHorizontal: scaledSpacing(24),
    paddingTop: scaledSpacing(16),
  },
});
