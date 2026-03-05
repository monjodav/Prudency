import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { getProfile, updateProfile } from '@/src/services/authService';
import { ms, scaledFontSize, scaledIcon } from '@/src/utils/scaling';
import { SplashLogo } from '@/src/components/splash/SplashLogo';

export default function PersonalInfoScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [originalData, setOriginalData] = useState(formData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => {
      const data = {
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
      };
      setFormData(data);
      setOriginalData(data);
    }).catch(() => {
      // silently fail — fields stay empty
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim() || null,
      });

      setOriginalData(formData);
      setIsEditing(false);
      Alert.alert('Succès', 'Tes informations ont été mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <DarkScreen scrollable avoidKeyboard headerTitle="Infos personnelles">
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <SplashLogo size={ms(56, 0.5)} />
        </View>
        <Pressable style={styles.changeAvatarButton}>
          <FontAwesome name="camera" size={scaledIcon(14)} color={colors.primary[300]} />
          <Text style={styles.changeAvatarText}>Changer la photo</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Input
          label="Prénom"
          value={formData.firstName}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, firstName: value }))}
          editable={isEditing}
          placeholder="Ton prénom"
        />

        <Input
          label="Nom"
          value={formData.lastName}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, lastName: value }))}
          editable={isEditing}
          placeholder="Ton nom"
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, email: value }))}
          editable={isEditing}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ton@email.com"
        />

        <View style={styles.phoneSection}>
          <Input
            label="Téléphone"
            value={formData.phone}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            editable={false}
            keyboardType="phone-pad"
            placeholder="+33 6 12 34 56 78"
          />
          {isEditing && (
            <Pressable style={styles.changePhoneButton}>
              <Text style={styles.changePhoneText}>Modifier le numéro</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <>
            <Button
              title="Enregistrer"
              onPress={handleSave}
              loading={isLoading}
              fullWidth
            />
            <Button
              title="Annuler"
              variant="outline"
              onPress={handleCancel}
              fullWidth
            />
          </>
        ) : (
          <Button
            title="Modifier"
            onPress={() => setIsEditing(true)}
            fullWidth
          />
        )}
      </View>
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  avatar: {
    width: ms(100, 0.5),
    height: ms(100, 0.5),
    borderRadius: ms(100, 0.5) / 2,
    backgroundColor: colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: scaledFontSize(40),
    fontWeight: '700',
    color: colors.white,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  changeAvatarText: {
    ...typography.bodySmall,
    color: colors.primary[300],
  },
  form: {
    gap: spacing[1],
    marginBottom: spacing[8],
  },
  phoneSection: {
    gap: spacing[2],
  },
  changePhoneButton: {
    alignSelf: 'flex-start',
  },
  changePhoneText: {
    ...typography.bodySmall,
    color: colors.primary[300],
  },
  actions: {
    gap: spacing[3],
  },
});
