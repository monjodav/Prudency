import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, Image, StyleSheet, Linking, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms, mvs, scaledIcon, scaledFontSize, scaledSpacing, scaledRadius } from '@/src/utils/scaling';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  notifyBySms: boolean;
  notifyByPush: boolean;
}

interface ContactFormProps {
  initialValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const DEFAULT_VALUES: ContactFormData = {
  name: '',
  phone: '',
  email: '',
  isPrimary: false,
  notifyBySms: true,
  notifyByPush: true,
};

const COUNTRY_PREFIX = '+33';

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

export function ContactForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Ajouter',
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const updateField = <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const phoneDigits = phoneDisplay.replace(/\D/g, '');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      newErrors.name = 'Le prénom est requis';
    }
    if (!phoneDigits) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (phoneDigits.length < 9) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const e164Phone = `${COUNTRY_PREFIX}${phoneDigits}`;
      onSubmit({ ...form, name: fullName, phone: e164Phone });
    }
  };

  const handleImportContact = async () => {
    const { status, canAskAgain } = await Contacts.requestPermissionsAsync();

    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Accès aux contacts',
          'Prudency a besoin d\'accéder à tes contacts pour importer les informations. Active l\'accès dans les réglages.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réglages', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }

    const picked = await Contacts.presentContactPickerAsync();
    if (!picked?.id) return;

    const contact = await Contacts.getContactByIdAsync(picked.id, [
      Contacts.Fields.FirstName,
      Contacts.Fields.LastName,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Image,
    ]);
    if (!contact) return;

    if (contact.lastName) setFirstName(contact.lastName);
    if (contact.firstName) setLastName(contact.firstName);

    if (contact.image?.uri) {
      setAvatarUri(contact.image.uri);
    }

    const rawPhone = contact.phoneNumbers?.[0]?.number;
    if (rawPhone) {
      const cleaned = rawPhone.replace(/[\s.\-()]/g, '');
      let digits = cleaned;
      if (cleaned.startsWith('+33')) {
        digits = cleaned.slice(3);
      } else if (cleaned.startsWith('0')) {
        digits = cleaned.slice(1);
      }
      setPhoneDisplay(formatPhoneDisplay(digits));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    } else {
      Alert.alert(
        'Numéro manquant',
        'Ce contact n\'a pas de numéro de téléphone enregistré.',
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {avatarUri && (
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </View>
      )}

      <Input
        label="Prénom"
        placeholder="Prénom"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
        autoCapitalize="words"
        variant="dark"
      />

      <Input
        label="Nom *"
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        variant="dark"
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
            value={phoneDisplay}
            onChangeText={(text) => {
              setPhoneDisplay(formatPhoneDisplay(text));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
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

      <Button
        title="Importer un contact"
        variant="outline"
        onPress={handleImportContact}
        fullWidth
        icon={<Ionicons name="download-outline" size={scaledIcon(18)} color={colors.primary[400]} />}
      />

      <View style={styles.submitWrapper}>
        <Button
          title={submitLabel}
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
          disabled={!firstName.trim() || phoneDigits.length < 9}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatar: {
    width: ms(80, 0.4),
    height: ms(80, 0.4),
    borderRadius: ms(40, 0.4),
    backgroundColor: colors.gray[800],
  },
  phoneFieldContainer: {
    gap: scaledSpacing(8),
    marginBottom: spacing[3],
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
  submitWrapper: {
    marginTop: mvs(180, 0.5),
  },
});
