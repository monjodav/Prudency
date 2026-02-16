import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
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
    if (!form.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Le numero de telephone est requis';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numero de telephone invalide';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Nom"
        placeholder="Nom du contact"
        value={form.name}
        onChangeText={(text) => updateField('name', text)}
        error={errors.name}
        autoCapitalize="words"
      />

      <Input
        label="Telephone"
        placeholder="+33 6 12 34 56 78"
        value={form.phone}
        onChangeText={(text) => updateField('phone', text)}
        error={errors.phone}
        keyboardType="phone-pad"
      />

      <Input
        label="Email (optionnel)"
        placeholder="contact@exemple.fr"
        value={form.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Contact principal</Text>
        <Switch
          value={form.isPrimary}
          onValueChange={(value) => updateField('isPrimary', value)}
          trackColor={{ true: colors.primary[500], false: colors.gray[300] }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Notification SMS</Text>
        <Switch
          value={form.notifyBySms}
          onValueChange={(value) => updateField('notifyBySms', value)}
          trackColor={{ true: colors.primary[500], false: colors.gray[300] }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Notification push</Text>
        <Switch
          value={form.notifyByPush}
          onValueChange={(value) => updateField('notifyByPush', value)}
          trackColor={{ true: colors.primary[500], false: colors.gray[300] }}
          thumbColor={colors.white}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Annuler"
          variant="ghost"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[2],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  switchLabel: {
    ...typography.body,
    color: colors.gray[700],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[6],
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
