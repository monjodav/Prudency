import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { useAuth } from '@/src/hooks/useAuth';
import { scaledSpacing, scaledFontSize, scaledLineHeight, scaledIcon, ms } from '@/src/utils/scaling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  titleBold?: boolean;
  isWelcome?: boolean;
  isFinal?: boolean;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur\nPrudency, {name} \u{1F499}',
    description:
      'Tu n\'es plus seule pendant tes déplacements. Prudency veille sur toi, à chaque trajet.',
    titleBold: true,
    isWelcome: true,
  },
  {
    id: 'contacts',
    title: 'Un cercle de confiance',
    description:
      'Choisis une personne de confiance. Elle sera prévenue uniquement si un problème survient durant ton trajet.',
  },
  {
    id: 'privacy',
    title: 'Garde tes trajets privés',
    description:
      'Tu es la seule personne à voir ton trajet, si tu le souhaites. Une alerte est envoyée uniquement si quelque chose ne se passe pas comme prévu.',
  },
  {
    id: 'notes',
    title: 'Des trajets plus sereins',
    description:
      'Ce carnet de bord te permet de noter tout ce qui te semble important pendant tes trajets.',
  },
  {
    id: 'security',
    title: 'Une sécurité discrète',
    description:
      'Une validation te sera demandée à la fin ou à l\'annulation d\'un trajet, uniquement pour ta sécurité.',
  },
  {
    id: 'ready',
    title: 'C\'est parti !',
    description:
      'Tu peux maintenant utiliser Prudency en toute sérénité.',
    isFinal: true,
  },
];

// 4 segments in progress bar (welcome = start, 4 content slides, ready = end)
const NUM_SEGMENTS = 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const userName = profile?.first_name || 'toi';
  const [segmentLayouts, setSegmentLayouts] = useState<{ x: number; width: number }[]>([]);

  const onSegmentLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setSegmentLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  }, []);

  // Halo position from Figma:
  // Slide 0 (Bienvenue)  → left edge of segment 0
  // Slide 1 (Contacts)   → right edge of segment 0
  // Slide 2 (Privés)     → left edge of segment 1
  // Slide 3 (Sereins)    → left edge of segment 2
  // Slide 4 (Sécurité)   → left edge of segment 3
  // Slide 5 (C'est parti)→ right edge of segment 3
  const getHaloLeft = (): number => {
    if (segmentLayouts.length < NUM_SEGMENTS) return 0;
    if (currentIndex === 0) {
      const seg = segmentLayouts[0];
      return seg ? seg.x : 0;
    }
    if (currentIndex === 1) {
      const seg = segmentLayouts[0];
      return seg ? seg.x + seg.width : 0;
    }
    if (currentIndex <= NUM_SEGMENTS) {
      // Slides 2-4 → left edge of segment (currentIndex - 1)
      const seg = segmentLayouts[currentIndex - 1];
      return seg ? seg.x : 0;
    }
    // Slide 5 (final) → right edge of last segment
    const seg = segmentLayouts[NUM_SEGMENTS - 1];
    return seg ? seg.x + seg.width : 0;
  };

  // Segment coloring from Figma:
  // The segment the dot is ON = white
  // Segments before = blue (active)
  // Segments after = gray (inactive)
  const getSegmentStyle = (i: number) => {
    // Which segment is the dot currently on?
    // Slide 0-1: dot on segment 0
    // Slide 2: dot on segment 1
    // Slide 3: dot on segment 2
    // Slide 4: dot on segment 3
    // Slide 5: dot past all segments (all blue)
    const dotSegment = currentIndex <= 1 ? 0 : currentIndex - 1;
    if (currentIndex === STEPS.length - 1) {
      // Final slide: all segments blue
      return styles.segmentActive;
    }
    if (i < dotSegment) return styles.segmentActive;
    if (i === dotSegment) return styles.segmentCurrent;
    return styles.segmentInactive;
  };

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
    router.replace('/(auth)/add-contact');
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: STEPS.length - 1 });
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => {
    const title = item.title.replace('{name}', userName);

    return (
      <View style={styles.step}>
        <Text style={[styles.stepTitle, item.titleBold && styles.stepTitleBold]}>
          {title}
        </Text>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
    );
  };

  const currentStep = STEPS[currentIndex];
  const isFinal = currentStep?.isFinal;
  const isWelcome = currentStep?.isWelcome;

  const getButtonTitle = () => {
    if (isWelcome) return 'Commencer la démo';
    if (isFinal) return 'Commencer';
    return 'Suivant';
  };

  return (
    <OnboardingBackground>
      {/* Progress bar — 4 segmented bars with halo cursor */}
      <View style={{ paddingHorizontal: scaledSpacing(16), paddingTop: insets.top + scaledSpacing(8) }}>
        <View style={styles.barWrapper}>
          {/* Segments */}
          {Array.from({ length: NUM_SEGMENTS }).map((_, i) => (
            <View
              key={i}
              onLayout={(e) => onSegmentLayout(i, e)}
              style={[styles.segment, getSegmentStyle(i)]}
            />
          ))}
          {/* Halo cursor — placed at segment boundaries using measured positions */}
          {segmentLayouts.length === NUM_SEGMENTS && (
            <View
              pointerEvents="none"
              style={[
                styles.haloDot,
                { left: getHaloLeft() - HALO_SIZE / 2 },
              ]}
            >
              <Svg width={HALO_SIZE} height={HALO_SIZE} viewBox="0 0 30 30" fill="none">
                <Ellipse cx="15" cy="15" rx="15" ry="15" fill="#5A356B" opacity={0.6} />
                <Ellipse cx="15" cy="15" rx="12" ry="12" fill="#9B59B6" opacity={0.7} />
                <Ellipse cx="15" cy="15" rx="9" ry="9" fill="#CC63F9" />
              </Svg>
            </View>
          )}
        </View>
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
        scrollEnabled={!isWelcome}
      />

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={getButtonTitle()}
          onPress={handleNext}
          fullWidth
        />
        {!isFinal && (
          <Pressable onPress={isFinal ? handleComplete : handleSkip} style={styles.skipLink}>
            <Text style={styles.skipLinkText}>Passer la démo</Text>
          </Pressable>
        )}
      </View>
    </OnboardingBackground>
  );
}

const HALO_SIZE = ms(26, 0.5);
const BAR_HEIGHT = ms(6, 0.5);

const styles = StyleSheet.create({
  barWrapper: {
    flexDirection: 'row',
    gap: scaledSpacing(9),
    alignItems: 'center',
    height: HALO_SIZE,
  },
  segment: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
  segmentActive: {
    backgroundColor: colors.primary[400],
  },
  segmentCurrent: {
    backgroundColor: 'rgba(232, 234, 248, 0.6)',
  },
  segmentInactive: {
    backgroundColor: 'rgba(232, 234, 248, 0.15)',
  },
  haloDot: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    top: 0,
  },
  flatList: {
    flex: 1,
  },
  step: {
    width: SCREEN_WIDTH,
    paddingHorizontal: scaledSpacing(50),
    paddingTop: scaledSpacing(100),
  },
  stepTitle: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(8),
  },
  stepTitleBold: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  stepDescription: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
  },
  buttonContainer: {
    paddingHorizontal: scaledSpacing(50),
    paddingBottom: scaledSpacing(24),
    gap: scaledSpacing(8),
    alignItems: 'center',
  },
  skipLink: {
    paddingVertical: scaledSpacing(8),
  },
  skipLinkText: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.white,
  },
});
