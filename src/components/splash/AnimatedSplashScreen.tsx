import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { colors } from '@/src/theme/colors';
import { SplashLogo } from './SplashLogo';
import { s, vs, ms } from '@/src/utils/scaling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Figma values (design at 393px width) - scaled for responsiveness
const DESIGN_WIDTH = 393;
const SCALE_FACTOR = SCREEN_WIDTH / DESIGN_WIDTH;

const ELLIPSE_WIDTH = 1255 * SCALE_FACTOR;
const ELLIPSE_HEIGHT = 1086 * SCALE_FACTOR;
const BLUR_RADIUS = 222 * SCALE_FACTOR;

interface AnimatedSplashScreenProps {
  onAnimationComplete?: () => void;
  isLoading?: boolean;
}

export function AnimatedSplashScreen({
  onAnimationComplete,
  isLoading = true,
}: AnimatedSplashScreenProps) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const ellipseOpacity = useSharedValue(0.3);
  const exitOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.2)) });

    textOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
    );
    textTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
    );

    ellipseOpacity.value = withSequence(
      withTiming(0.5, { duration: 1000 }),
      withTiming(0.4, { duration: 1000 })
    );
  }, [logoOpacity, logoScale, textOpacity, textTranslateY, ellipseOpacity]);

  useEffect(() => {
    if (!isLoading && onAnimationComplete) {
      exitOpacity.value = withTiming(
        0,
        { duration: 400, easing: Easing.in(Easing.ease) },
        () => {
          runOnJS(onAnimationComplete)();
        }
      );
    }
  }, [isLoading, onAnimationComplete, exitOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const ellipseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ellipseOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  // SVG dimensions to contain the blurred ellipse
  const svgWidth = ELLIPSE_WIDTH + BLUR_RADIUS * 2;
  const svgHeight = ELLIPSE_HEIGHT + BLUR_RADIUS * 2;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Background */}
      <View style={styles.background} />

      {/* Blurred purple ellipse using SVG radial gradient */}
      <Animated.View
        style={[
          styles.ellipseContainer,
          {
            top: -svgHeight * 0.35,
            left: (SCREEN_WIDTH - svgWidth) / 2,
            width: svgWidth,
            height: svgHeight,
          },
          ellipseAnimatedStyle,
        ]}
      >
        <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <Defs>
            <RadialGradient
              id="ellipseGradient"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#744385" stopOpacity={0.7} />
              <Stop offset="40%" stopColor="#744385" stopOpacity={0.5} />
              <Stop offset="70%" stopColor="#744385" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#744385" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={svgWidth / 2}
            cy={svgHeight / 2}
            rx={(ELLIPSE_WIDTH + BLUR_RADIUS) / 2}
            ry={(ELLIPSE_HEIGHT + BLUR_RADIUS) / 2}
            fill="url(#ellipseGradient)"
          />
        </Svg>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={logoAnimatedStyle}>
          <SplashLogo size={ms(120)} />
        </Animated.View>

        <Animated.Text style={[styles.title, textAnimatedStyle]}>
          PRUDENCY
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    transform: [{ rotate: '-172.188deg' }],
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Montserrat_200ExtraLight',
    fontSize: ms(42, 0.3),
    color: colors.white,
    letterSpacing: s(6),
    marginTop: vs(24),
  },
});
