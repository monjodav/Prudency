import React, { useState } from 'react';
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
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import { ms, scaledFontSize, scaledIcon } from '@/src/utils/scaling';

export default function PersonalInfoScreen() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name ?? '',
    lastName: user?.user_metadata?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.user_metadata?.phone ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });

      if (error) throw error;

      setIsEditing(false);
      Alert.alert('Succès', 'Tes informations ont été mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.user_metadata?.first_name ?? '',
      lastName: user?.user_metadata?.last_name ?? '',
      email: user?.email ?? '',
      phone: user?.user_metadata?.phone ?? '',
    });
    setIsEditing(false);
  };

  return (
    <DarkScreen scrollable avoidKeyboard>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {formData.firstName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
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
