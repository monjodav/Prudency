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
import * as Contacts from 'expo-contacts';
import { colors } from '@/src/theme/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useContacts } from '@/src/hooks/useContacts';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, figmaScale, ms } from '@/src/utils/scaling';

/**
 * Ajout d'une personne de confiance
 * Allows user to add their first trusted contact
 * Can import from phone contacts or enter manually
 */
export default function AddContactScreen() {
  const router = useRouter();
  const { createContact } = useContacts();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nom requis';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Numéro de téléphone requis';
    } else if (!/^(\+33|0)[1-9](\d{8})$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide';
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

      // Open contact picker
      const contact = await Contacts.presentContactPickerAsync();

      if (contact) {
        setName(`${contact.firstName || ''} ${contact.lastName || ''}`.trim());
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

  const handleSaveContact = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      await createContact({
        name: name.trim(),
        phone: cleanPhone,
        isPrimary: true,
      });

      router.replace('/(tabs)');
    } catch {
      setErrors({ submit: 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Ajouter plus tard ?',
      'Tu pourras ajouter un contact de confiance à tout moment depuis ton profil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const isFormValid = name.trim() !== '' && phone.trim() !== '';

  return (
    <View style={styles.container}>
      {/* Background gradient ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={scaledIcon(48)} color={colors.primary[50]} />
            </View>
            <Text style={styles.title}>Ajoute une personne de confiance</Text>
            <Text style={styles.subtitle}>
              Cette personne sera prévenue si quelque chose ne va pas pendant ton trajet.
            </Text>
          </View>

          {/* Import from contacts button */}
          <Pressable style={styles.importButton} onPress={handleImportContact}>
            <Ionicons name="people" size={scaledIcon(24)} color={colors.primary[50]} />
            <Text style={styles.importButtonText}>Importer depuis mes contacts</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou saisis manuellement</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nom *"
              placeholder="Maman"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              autoCapitalize="words"
              variant="dark"
            />

            <Input
              label="Téléphone *"
              placeholder="+33 6 12 34 56 78"
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

          </View>

          {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Ajouter ce contact"
              onPress={handleSaveContact}
              loading={loading}
              fullWidth
              disabled={!isFormValid}
            />
            <Pressable onPress={handleSkip} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>Plus tard</Text>
            </Pressable>
          </View>

          {/* Logo at bottom */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PRUDENCY</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaledSpacing(40),
    paddingTop: scaledSpacing(80),
    paddingBottom: scaledSpacing(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: scaledSpacing(32),
  },
  iconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: scaledRadius(40),
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(12),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
    opacity: 0.9,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaledSpacing(12),
    paddingVertical: scaledSpacing(16),
    paddingHorizontal: scaledSpacing(24),
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: 9999,
    marginBottom: scaledSpacing(24),
  },
  importButtonText: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaledSpacing(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary[50],
    opacity: 0.3,
  },
  dividerText: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    marginHorizontal: scaledSpacing(16),
    opacity: 0.7,
  },
  form: {
    gap: scaledSpacing(16),
    marginBottom: scaledSpacing(32),
  },
  errorText: {
    fontSize: scaledFontSize(14),
    color: colors.error[400],
    textAlign: 'center',
  },
  buttonContainer: {
    gap: scaledSpacing(16),
  },
  skipLink: {
    alignItems: 'center',
    padding: scaledSpacing(8),
  },
  skipLinkText: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    opacity: 0.8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: scaledSpacing(32),
  },
  logo: {
    fontSize: scaledFontSize(35),
    fontWeight: '200',
    fontFamily: 'Montserrat_200ExtraLight',
    color: colors.white,
    letterSpacing: ms(2, 0.3),
    textAlign: 'center',
  },
});
