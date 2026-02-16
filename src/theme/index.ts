export { colors, type ColorPalette } from './colors';
export { typography, fontSizes, fontWeights, fontFamilies, lineHeights } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  shadows: require('./spacing').shadows,
} as const;

export type Theme = typeof theme;
