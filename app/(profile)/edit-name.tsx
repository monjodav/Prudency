import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/src/components/ui/Loader';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { updateProfile } from '@/src/services/authService';
import { scaledIcon } from '@/src/utils/scaling';

const TITLES: Record<string, string> = {
  firstName: 'Prénom',
  lastName: 'Nom',
};

const PLACEHOLDERS: Record<string, string> = {
  firstName: 'Ton prénom',
  lastName: 'Ton nom',
};

const PROFILE_KEYS: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
};

export default function EditNameScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { field, value: initialValue } = useLocalSearchParams<{
    field: string;
    value: string;
  }>();

  const [value, setValue] = useState(initialValue ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = TITLES[field ?? ''] ?? 'Modifier';
  const placeholder = PLACEHOLDERS[field ?? ''] ?? '';
  const profileKey = PROFILE_KEYS[field ?? ''];

  const handleSave = async () => {
    if (!profileKey || isSaving) return;
    const trimmed = value.trim();
    if (trimmed === (initialValue ?? '').trim()) {
      router.back();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({ [profileKey]: trimmed || null });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.back();
    } catch {
      setError('La sauvegarde a échoué. Réessaie.');
      setIsSaving(false);
    }
  };

  return (
    <DarkScreen
      avoidKeyboard
      headerTitle={title}
      headerLeft={
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
          <Ionicons name="close" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
      }
      headerRight={
        <Pressable onPress={handleSave} hitSlop={12} disabled={isSaving} style={styles.headerButton}>
          {isSaving ? (
            <Loader size="sm" color={colors.brandPosition[50]} />
          ) : (
            <Ionicons name="checkmark" size={scaledIcon(24)} color={colors.brandPosition[50]} />
          )}
        </Pressable>
      }
    >
      <Input
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
        error={error ?? undefined}
      />
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
});
