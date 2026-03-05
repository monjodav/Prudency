import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { colors } from '@/src/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCALE_FACTOR = SCREEN_WIDTH / 393;
const ELLIPSE_WIDTH = 1255 * SCALE_FACTOR;
const ELLIPSE_HEIGHT = 1086 * SCALE_FACTOR;
const BLUR_RADIUS = 222 * SCALE_FACTOR;
const SVG_WIDTH = ELLIPSE_WIDTH + BLUR_RADIUS * 2;
const SVG_HEIGHT = ELLIPSE_HEIGHT + BLUR_RADIUS * 2;

export function ScreenBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.ellipse,
          {
            top: -SVG_HEIGHT * 0.35,
            left: (SCREEN_WIDTH - SVG_WIDTH) / 2,
            width: SVG_WIDTH,
            height: SVG_HEIGHT,
          },
        ]}
      >
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          <Defs>
            <RadialGradient id="bg-glow" cx="50%" cy="50%" rx="50%" ry="50%" gradientUnits="objectBoundingBox">
              <Stop offset="0%" stopColor="#744385" stopOpacity={0.7} />
              <Stop offset="40%" stopColor="#744385" stopOpacity={0.5} />
              <Stop offset="70%" stopColor="#744385" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#744385" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={SVG_WIDTH / 2}
            cy={SVG_HEIGHT / 2}
            rx={(ELLIPSE_WIDTH + BLUR_RADIUS) / 2}
            ry={(ELLIPSE_HEIGHT + BLUR_RADIUS) / 2}
            fill="url(#bg-glow)"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ellipse: {
    position: 'absolute',
    opacity: 0.4,
    transform: [{ rotate: '-172.188deg' }],
  },
});
