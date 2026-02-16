import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { colors } from '@/src/theme/colors';
import { figmaScale, SCREEN_WIDTH } from '@/src/utils/scaling';

const ELLIPSE_WIDTH = figmaScale(1255);
const ELLIPSE_HEIGHT = figmaScale(1086);
const BLUR_RADIUS = figmaScale(222);

interface OnboardingBackgroundProps {
  children: React.ReactNode;
}

export function OnboardingBackground({ children }: OnboardingBackgroundProps) {
  const svgWidth = ELLIPSE_WIDTH + BLUR_RADIUS * 2;
  const svgHeight = ELLIPSE_HEIGHT + BLUR_RADIUS * 2;

  return (
    <View style={styles.container}>
      {/* Dark background */}
      <View style={styles.background} />

      {/* Blurred purple ellipse - same as splash screen */}
      <View
        style={[
          styles.ellipseContainer,
          {
            top: -svgHeight * 0.35,
            left: (SCREEN_WIDTH - svgWidth) / 2,
            width: svgWidth,
            height: svgHeight,
          },
        ]}
      >
        <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <Defs>
            <RadialGradient
              id="onboardingEllipseGradient"
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
            fill="url(#onboardingEllipseGradient)"
          />
        </Svg>
      </View>

      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    opacity: 0.45,
  },
});
