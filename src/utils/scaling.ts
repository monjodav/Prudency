/**
 * Responsive scaling utilities for Prudency
 *
 * Base dimensions: 393x852 (iPhone 17 Pro — Figma reference)
 * On the reference device, all values pass through unchanged (ratio = 1).
 * On other devices, values scale proportionally.
 *
 * Custom implementation avoids dependency on react-native-size-matters/extend
 * and its @env requirement, while using the same math.
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

// Figma artboard = iPhone 17 Pro
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/** Scale based on screen width */
export const scale = (size: number): number =>
  (shortDimension / BASE_WIDTH) * size;

/** Scale based on screen height */
export const verticalScale = (size: number): number =>
  (longDimension / BASE_HEIGHT) * size;

/** Scale with a resize factor (0 = no scale, 1 = full width scale) */
export const moderateScale = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;

/** Vertical moderate scale */
export const moderateVerticalScale = (size: number, factor = 0.5): number =>
  size + (verticalScale(size) - size) * factor;

// Short aliases
export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;

/**
 * Font size — moderate scale factor 0.4
 * Fonts shouldn't scale as aggressively as layout dimensions
 */
export const scaledFontSize = (size: number): number => moderateScale(size, 0.4);

/**
 * Line height — moderate scale factor 0.4 (matches font scaling)
 */
export const scaledLineHeight = (size: number): number => moderateScale(size, 0.4);

/**
 * Spacing (padding, margin, gap) — moderate scale factor 0.5
 */
export const scaledSpacing = (size: number): number => moderateScale(size, 0.5);

/**
 * Border radius — moderate scale factor 0.3
 */
export const scaledRadius = (size: number): number => moderateScale(size, 0.3);

/**
 * Icon size — moderate scale factor 0.4
 */
export const scaledIcon = (size: number): number => moderateScale(size, 0.4);

/**
 * Shadow — scales offset and radius proportionally, preserves opacity and elevation
 */
export const scaledShadow = (shadow: {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}): {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
} => ({
  shadowColor: shadow.shadowColor,
  shadowOffset: {
    width: moderateScale(shadow.shadowOffset.width, 0.3),
    height: moderateScale(shadow.shadowOffset.height, 0.3),
  },
  shadowOpacity: shadow.shadowOpacity,
  shadowRadius: moderateScale(shadow.shadowRadius, 0.3),
  elevation: shadow.elevation, // Android integer, not scaled
});

/**
 * Figma scale — linear ratio for large decorative elements (ellipses, blobs)
 * Uses direct width ratio so decorative elements cover the same visual proportion
 */
export const figmaScale = (size: number): number =>
  size * (shortDimension / BASE_WIDTH);

export const SCREEN_WIDTH = shortDimension;
export const SCREEN_HEIGHT = longDimension;
