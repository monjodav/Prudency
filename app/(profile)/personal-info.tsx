import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/src/services/authService';
import { ms, scaledFontSize, scaledIcon, scaledSpacing, scaledRadius } from '@/src/utils/scaling';

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/^\+33/, '').replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 1));
  if (digits.length > 1) parts.push(digits.slice(1, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 5));
  if (digits.length > 5) parts.push(digits.slice(5, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  return parts.join(' ');
}

interface FieldRowProps {
  label: string;
  value: string;
  onPress?: () => void;
  disabled?: boolean;
}

function FieldRow({ label, value, onPress, disabled }: FieldRowProps) {
  return (
    <Pressable
      style={styles.fieldRow}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, disabled && styles.fieldValueDisabled]}>
          {value || '—'}
        </Text>
      </View>
      {onPress && !disabled && (
        <Ionicons name="chevron-forward" size={scaledIcon(18)} color={colors.gray[400]} />
      )}
    </Pressable>
  );
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const email = profile?.email ?? '';
  const phone = profile?.phone ?? '';

  useEffect(() => {
    if (profile?.avatar_url) setAvatarUri(profile.avatar_url);
  }, [profile]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "Autorise l'accès aux photos dans les réglages.",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setAvatarUri(result.assets[0].uri);
  };

  return (
    <DarkScreen scrollable headerTitle="Infos personnelles">
      <View style={styles.avatarSection}>
        <Pressable style={styles.avatarWrapper} onPress={handlePickAvatar}>
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {[firstName, lastName]
                    .filter(Boolean)
                    .map((n) => n.charAt(0))
                    .join('')
                    .toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={scaledIcon(12)} color={colors.white} />
          </View>
        </Pressable>
      </View>

      <View style={styles.fieldList}>
        <FieldRow
          label="Prénom"
          value={firstName}
          onPress={() =>
            router.push({
              pathname: '/(profile)/edit-name',
              params: { field: 'firstName', value: firstName },
            })
          }
        />
        <FieldRow
          label="Nom"
          value={lastName}
          onPress={() =>
            router.push({
              pathname: '/(profile)/edit-name',
              params: { field: 'lastName', value: lastName },
            })
          }
        />
        <FieldRow
          label="Email"
          value={email}
          disabled
        />
        <Pressable
          style={styles.fieldRow}
          onPress={() => router.push('/(profile)/edit-phone')}
        >
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <View style={styles.phoneDisplay}>
              <Text style={styles.phonePrefixFlag}>{'\u{1F1EB}\u{1F1F7}'}</Text>
              <Text style={styles.fieldValue}>+33</Text>
              <Text style={styles.phoneSeparator}>|</Text>
              <Text style={styles.fieldValue}>
                {formatPhoneDisplay(phone)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={scaledIcon(18)} color={colors.gray[400]} />
        </Pressable>
      </View>
    </DarkScreen>
  );
}

const AVATAR_SIZE = ms(100, 0.5);
const RING_SIZE = AVATAR_SIZE + ms(10, 0.5);
const BADGE_SIZE = ms(28, 0.5);

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[950],
  },
  fieldList: {
    gap: spacing[1],
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaledSpacing(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldContent: {
    flex: 1,
    gap: scaledSpacing(4),
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.gray[400],
  },
  fieldValue: {
    fontSize: scaledFontSize(16),
    fontFamily: 'Inter_400Regular',
    color: colors.white,
  },
  fieldValueDisabled: {
    color: colors.button.disabledText,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaledSpacing(6),
  },
  phonePrefixFlag: {
    fontSize: scaledFontSize(16),
  },
  phoneSeparator: {
    fontSize: scaledFontSize(16),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[500],
  },
});
