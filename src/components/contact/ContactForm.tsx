import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { mvs } from '@/src/utils/scaling';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { scaledIcon } from '@/src/utils/scaling';

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

  const updateField = <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      newErrors.name = 'Le prénom est requis';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      onSubmit({ ...form, name: fullName });
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

    const contact = await Contacts.presentContactPickerAsync();
    if (!contact) return;

    if (contact.firstName) setFirstName(contact.firstName);
    if (contact.lastName) setLastName(contact.lastName);

    const phone = contact.phoneNumbers?.[0]?.number;
    if (phone) updateField('phone', phone);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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

      <Input
        label="Téléphone *"
        placeholder="+33 6 12 34 56 78"
        value={form.phone}
        onChangeText={(text) => updateField('phone', text)}
        error={errors.phone}
        keyboardType="phone-pad"
        variant="dark"
      />

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
          disabled={!firstName.trim() || !form.phone.trim()}
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
  submitWrapper: {
    marginTop: mvs(180, 0.5),
  },
});
