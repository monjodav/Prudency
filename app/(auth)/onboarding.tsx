import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import {
  requestLocationPermission,
  requestNotificationPermission,
} from '@/src/utils/permissions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: '1',
    icon: 'shield',
    title: 'Protegez vos trajets',
    description:
      'Prudency veille sur vous pendant vos deplacements et previent vos proches en cas de probleme.',
  },
  {
    id: '2',
    icon: 'users',
    title: 'Contacts de confiance',
    description:
      'Ajoutez jusqu\'a 5 personnes de confiance qui seront prevenues automatiquement en cas d\'alerte.',
  },
  {
    id: '3',
    icon: 'map-marker',
    title: 'Localisation',
    description:
      'Autorisez l\'acces a votre position pour que vos contacts puissent vous localiser en cas de besoin.',
  },
  {
    id: '4',
    icon: 'bell',
    title: 'Notifications',
    description:
      'Activez les notifications pour etre alertee quand vous approchez de l\'heure d\'arrivee prevue.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstItem = viewableItems[0];
      if (firstItem && firstItem.index != null) {
        setCurrentIndex(firstItem.index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex === 2) {
      await requestLocationPermission();
    }
    if (currentIndex === 3) {
      await requestNotificationPermission();
    }

    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Placeholder: will mark onboarding as completed via useAuth hook
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={styles.step}>
      <View style={styles.iconContainer}>
        <FontAwesome name={item.icon} size={48} color={colors.primary[500]} />
      </View>
      <Text style={styles.stepTitle}>{item.title}</Text>
      <Text style={styles.stepDescription}>{item.description}</Text>
    </View>
  );

  const isLastStep = currentIndex === STEPS.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {!isLastStep && (
          <Button title="Passer" variant="ghost" size="sm" onPress={handleSkip} />
        )}
      </View>

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
      />

      <View style={styles.pagination}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isLastStep ? 'Commencer' : 'Suivant'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: spacing[16],
    paddingHorizontal: spacing[6],
    minHeight: spacing[20],
  },
  flatList: {
    flex: 1,
  },
  step: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing[10],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  stepTitle: {
    ...typography.h2,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  stepDescription: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    paddingBottom: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
  },
  dotInactive: {
    backgroundColor: colors.gray[300],
  },
  buttonContainer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
});
