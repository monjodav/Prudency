import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { useAuthStore } from '@/src/stores/authStore';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { SplashLogo } from '@/src/components/splash/SplashLogo';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledRadius, scaledIcon, ms } from '@/src/utils/scaling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isWelcome?: boolean;
  isFinal?: boolean;
}

// Onboarding steps from Figma design
const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: 'heart',
    title: 'Bienvenue sur Prudency, {name} \u{1F499}',
    description:
      'Tu n\'es plus seule pendant tes déplacements. Prudency veille sur toi, à chaque trajet.',
    isWelcome: true,
  },
  {
    id: 'contacts',
    icon: 'people',
    title: 'Un cercle de confiance',
    description:
      'Choisis une personne de confiance. Elle sera prévenue uniquement si un problème survient durant ton trajet.',
  },
  {
    id: 'privacy',
    icon: 'eye-off',
    title: 'Garde tes trajets privés',
    description:
      'Tu es la seule personne à voir ton trajet, si tu le souhaites. Une alerte est envoyée uniquement si quelque chose ne se passe pas comme prévu.',
  },
  {
    id: 'notes',
    icon: 'document-text',
    title: 'Des trajets plus sereins',
    description:
      'Ce carnet de bord te permet de noter tout ce qui te semble important pendant tes trajets.',
  },
  {
    id: 'security',
    icon: 'shield-checkmark',
    title: 'Une sécurité discrète',
    description:
      'Une validation te sera demandée à la fin ou à l\'annulation d\'un trajet, uniquement pour ta sécurité.',
  },
  {
    id: 'ready',
    icon: 'checkmark-circle',
    title: 'C\'est parti !',
    description:
      'Tu peux maintenant utiliser Prudency en toute sérénité.',
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get user's first name for welcome screen
  const userName = user?.user_metadata?.first_name || 'toi';

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstItem = viewableItems[0];
      if (firstItem && firstItem.index != null) {
        setCurrentIndex(firstItem.index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Navigate to add trusted contact as per Figma flow
    router.replace('/(auth)/add-contact');
  };

  const handleSkip = () => {
    // Skip to final slide
    flatListRef.current?.scrollToIndex({ index: STEPS.length - 1 });
  };

  const handleStartDemo = () => {
    // Start from first content slide (after welcome)
    flatListRef.current?.scrollToIndex({ index: 1 });
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => {
    const title = item.title.replace('{name}', userName);

    return (
      <View style={styles.step}>
        <View style={styles.stepContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={scaledIcon(64)} color={colors.primary[50]} />
          </View>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepDescription}>{item.description}</Text>
        </View>

        {/* Step-specific buttons */}
        {item.isWelcome && (
          <View style={styles.welcomeButtons}>
            <Button
              title="Commencer la démo"
              onPress={handleStartDemo}
              fullWidth
            />
            <Pressable onPress={handleComplete} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>Passer la démo</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const currentStep = STEPS[currentIndex];
  const isWelcome = currentStep?.isWelcome;
  const isFinal = currentStep?.isFinal;

  return (
    <OnboardingBackground>
      {/* Skip button (not on welcome or final) */}
      {!isWelcome && !isFinal && (
        <View style={styles.skipContainer}>
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Passer la démo</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
        scrollEnabled={!isWelcome}
      />

      {/* Progress bar (not on welcome) */}
      {!isWelcome && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentIndex / (STEPS.length - 1)) * 100}%` },
              ]}
            />
          </View>
          <View
            style={[
              styles.progressPicto,
              { left: `${(currentIndex / (STEPS.length - 1)) * 100}%` },
            ]}
          >
            <SplashLogo size={scaledIcon(24)} />
          </View>
        </View>
      )}

      {/* Bottom button (not on welcome) */}
      {!isWelcome && (
        <View style={styles.buttonContainer}>
          <Button
            title={isFinal ? 'Commencer' : 'Suivant'}
            onPress={handleNext}
            fullWidth
          />
        </View>
      )}

    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  skipContainer: {
    position: 'absolute',
    top: scaledSpacing(60),
    right: scaledSpacing(24),
    zIndex: 10,
  },
  skipText: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    opacity: 0.8,
  },
  flatList: {
    flex: 1,
  },
  step: {
    width: SCREEN_WIDTH,
    paddingHorizontal: scaledSpacing(40),
    paddingTop: scaledSpacing(100),
    flex: 1,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: ms(120, 0.5),
    height: ms(120, 0.5),
    borderRadius: scaledRadius(60),
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaledSpacing(32),
  },
  stepTitle: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(16),
  },
  stepDescription: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
    opacity: 0.9,
  },
  welcomeButtons: {
    width: '100%',
    gap: scaledSpacing(16),
    marginBottom: scaledSpacing(40),
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
  progressContainer: {
    paddingHorizontal: scaledSpacing(40),
    paddingBottom: scaledSpacing(24),
    position: 'relative',
  },
  progressTrack: {
    height: ms(4, 0.5),
    backgroundColor: 'rgba(232, 234, 248, 0.2)',
    borderRadius: scaledRadius(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[50],
    borderRadius: scaledRadius(2),
  },
  progressPicto: {
    position: 'absolute',
    top: -ms(10, 0.5),
    marginLeft: -ms(12, 0.5),
  },
  buttonContainer: {
    paddingHorizontal: scaledSpacing(64),
    paddingBottom: scaledSpacing(16),
  },
});
