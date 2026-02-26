import { scaledSpacing, scaledRadius, scaledShadow } from '@/src/utils/scaling';

export const spacing = {
  0: 0,
  1: scaledSpacing(4),
  2: scaledSpacing(8),
  3: scaledSpacing(12),
  4: scaledSpacing(16),
  5: scaledSpacing(20),
  6: scaledSpacing(24),
  8: scaledSpacing(32),
  10: scaledSpacing(40),
  12: scaledSpacing(48),
  16: scaledSpacing(64),
  20: scaledSpacing(80),
  24: scaledSpacing(96),
};

export const borderRadius = {
  none: 0,
  sm: scaledRadius(4),
  tag: scaledRadius(5),
  md: scaledRadius(8),
  lg: scaledRadius(12),
  dialog: scaledRadius(15),
  xl: scaledRadius(16),
  '2xl': scaledRadius(24),
  segment: scaledRadius(67),
  segmentTrack: scaledRadius(184),
  full: 9999, // Pill shape — not scaled
};

export const shadows = {
  sm: scaledShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  md: scaledShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  lg: scaledShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }),
  xl: scaledShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  }),
};
