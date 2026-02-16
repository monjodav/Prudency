import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { figmaScale, scaledSpacing, scaledFontSize, ms } from '@/src/utils/scaling';

interface AuthBackgroundProps {
  children: React.ReactNode;
  showLogo?: boolean;
  style?: ViewStyle;
}

/**
 * Reusable background component for auth screens
 * Features the dark blue background with violet blur ellipse
 * Matching Figma design system
 */
export function AuthBackground({ children, showLogo = true, style }: AuthBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Background gradient ellipse - matches Figma */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      {/* Main content */}
      <View style={styles.content}>{children}</View>

      {/* Logo at bottom */}
      {showLogo && (
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>PRUDENCY</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950], // #040924 from Figma
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
    backgroundColor: colors.secondary[400], // #8d689e - violet from Figma
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: scaledSpacing(40),
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
