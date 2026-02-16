import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';

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
      // Placeholder: update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      Alert.alert('Succes', 'Vos informations ont ete mises a jour.');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {formData.firstName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Pressable style={styles.changeAvatarButton}>
          <FontAwesome name="camera" size={14} color={colors.primary[500]} />
          <Text style={styles.changeAvatarText}>Changer la photo</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Input
          label="Prenom"
          value={formData.firstName}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, firstName: value }))}
          editable={isEditing}
          placeholder="Votre prenom"
        />

        <Input
          label="Nom"
          value={formData.lastName}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, lastName: value }))}
          editable={isEditing}
          placeholder="Votre nom"
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(value) => setFormData((prev) => ({ ...prev, email: value }))}
          editable={isEditing}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="votre@email.com"
        />

        <View style={styles.phoneSection}>
          <Input
            label="Telephone"
            value={formData.phone}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            editable={false}
            keyboardType="phone-pad"
            placeholder="+33 6 12 34 56 78"
          />
          {isEditing && (
            <Pressable style={styles.changePhoneButton}>
              <Text style={styles.changePhoneText}>Modifier le numero</Text>
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
              style={styles.cancelButton}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: 40,
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
    color: colors.primary[500],
  },
  form: {
    gap: spacing[4],
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
    color: colors.primary[500],
  },
  actions: {
    gap: spacing[3],
  },
  cancelButton: {
    marginTop: 0,
  },
});
