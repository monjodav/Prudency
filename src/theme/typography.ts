import { TextStyle } from 'react-native';
import { scaledFontSize, scaledLineHeight, ms } from '@/src/utils/scaling';

// Font family names as loaded by expo-google-fonts
export const fontFamilies = {
  // Primary font family - Inter
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  // Secondary font - Montserrat (for logo)
  montserrat: {
    extraLight: 'Montserrat_200ExtraLight',
    regular: 'Montserrat_400Regular',
    bold: 'Montserrat_700Bold',
  },
  // Accent font - Kalam (for handwritten text)
  kalam: {
    regular: 'Kalam_400Regular',
  },
  // System fallback
  system: 'System',
} as const;

// Font sizes from Figma - scaled for device
export const fontSizes = {
  xs: scaledFontSize(12),    // Caption
  sm: scaledFontSize(14),    // Body small, labels, inputs
  md: scaledFontSize(16),    // Body, buttons
  lg: scaledFontSize(18),    // H4
  xl: scaledFontSize(20),    // H3
  '2xl': scaledFontSize(24), // H2, page titles
  '3xl': scaledFontSize(32), // H1
  '4xl': scaledFontSize(35), // Logo (34.77px rounded)
};

// Line heights from Figma - intrinsic percentages converted to multipliers
export const lineHeights = {
  tight: 1.21,   // ~121% - for headings (multiplier, not scaled)
  normal: 1.21,  // ~121% - body text
  relaxed: 1.4,  // ~140% - for larger line spacing
} as const;

export const fontWeights = {
  extraLight: '200' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

// Typography styles matching Figma Design System exactly
export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes['3xl'], // 32px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(39), // ~121%
  },
  h2: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes['2xl'], // 24px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(29), // ~121%
  },
  h3: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.xl, // 20px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(24), // ~121%
  },
  h4: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.lg, // 18px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(22), // ~121%
  },

  // Body text
  body: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.md, // 16px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(19), // ~121%
  },
  bodySmall: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(17), // ~121%
  },
  caption: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.xs, // 12px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(15), // ~121%
  },

  // Buttons
  button: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.md, // 16px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(19),
  },
  buttonSmall: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(17),
  },

  // Labels and inputs
  label: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(17), // ~121%
  },
  inputText: {
    fontFamily: fontFamilies.inter.regular,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(14),
  },

  // Links
  link: {
    fontFamily: fontFamilies.inter.semibold,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.semibold,
    lineHeight: scaledLineHeight(17),
  },

  // Special - Handwritten style (Kalam font)
  handwritten: {
    fontFamily: fontFamilies.kalam.regular,
    fontSize: fontSizes.sm, // 14px
    fontWeight: fontWeights.regular,
    lineHeight: scaledLineHeight(17),
  },

  // Logo
  logo: {
    fontFamily: fontFamilies.montserrat.extraLight,
    fontSize: fontSizes['4xl'], // 35px
    fontWeight: fontWeights.extraLight,
    lineHeight: scaledLineHeight(42),
    letterSpacing: ms(2, 0.3),
  },
};
