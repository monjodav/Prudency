import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuth } from '@/src/hooks/useAuth';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledIcon, ms } from '@/src/utils/scaling';

export default function AddContactInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();

  const completeOnboarding = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
    } catch {
      // Non-blocking: profile update failure should not prevent navigation
    }
    router.replace('/(tabs)');
  };

  const handleAdd = () => {
    router.push('/(auth)/add-contact-form');
  };

  const handleSkip = () => {
    Alert.alert(
      'Ajouter plus tard ?',
      'Tu pourras ajouter un contact de confiance à tout moment depuis ton profil.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: completeOnboarding },
      ]
    );
  };

  return (
    <OnboardingBackground>
      <View style={[styles.content, { paddingTop: insets.top + scaledSpacing(60) }]}>
        {/* Title + subtitle */}
        <View style={styles.textTop}>
          <Text style={styles.title}>
            Ajoute une personne de confiance
          </Text>
          <Text style={styles.subtitle}>
            Pour activer la{' '}
            <Text style={styles.bold}>protection pendant tes trajets</Text>
            , Prudency a besoin d'au moins une personne de confiance.
          </Text>
        </View>

        {/* Group icon circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="people" size={scaledIcon(80)} color={colors.white} />
        </View>

        {/* Bottom explanation texts */}
        <View style={styles.textBottom}>
          <Text style={styles.explanation}>
            Elle recevra une{' '}
            <Text style={styles.bold}>
              alerte uniquement si ton trajet n'est pas finalisé à temps
            </Text>
            {' '}ou si tu déclenches une alerte.
          </Text>
          <Text style={styles.secondary}>
            Cette personne devra accepter ta demande avant de pouvoir être alertée.
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + scaledSpacing(24) }]}>
          <Button
            title="Ajouter une personne de confiance"
            onPress={handleAdd}
            fullWidth
          />
          <Pressable onPress={handleSkip} style={styles.skipLink}>
            <Text style={styles.skipLinkText}>Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </OnboardingBackground>
  );
}

const ICON_CIRCLE_SIZE = ms(160, 0.5);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: scaledSpacing(40),
  },
  textTop: {
    alignItems: 'center',
    gap: scaledSpacing(8),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
  },
  bold: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    backgroundColor: colors.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: scaledSpacing(32),
  },
  textBottom: {
    alignItems: 'center',
    gap: scaledSpacing(16),
  },
  explanation: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
  },
  secondary: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: scaledSpacing(8),
  },
  skipLink: {
    height: ms(48, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipLinkText: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.white,
  },
});
