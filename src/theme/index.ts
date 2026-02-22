export { colors, type ColorPalette } from './colors';
export { typography, fontSizes, fontWeights, fontFamilies, lineHeights } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

// Local imports for theme object (re-exports don't create local bindings)
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
