export const colors = {
  // Primary colors (Bleu) - from Figma Design System
  primary: {
    50: '#e8eaf8',
    100: '#d0d5f0',
    200: '#a1abe1',
    300: '#7380d3',
    400: '#4456c4',
    500: '#2c41bc', // Main primary
    600: '#152cb5',
    700: '#112391',
    800: '#0d1a6d',
    900: '#081248',
    950: '#040924',
  },

  // Secondary colors (Violet) - from Figma Design System
  secondary: {
    50: '#f1ecf3',
    100: '#e2d9e7',
    200: '#c6b3cf',
    300: '#a98eb6',
    400: '#8d689e',
    500: '#7e5592', // Main secondary
    600: '#704286',
    700: '#5a356b',
    800: '#432850',
    900: '#2d1a36',
    950: '#160d1b',
  },

  // Neutrals (Grey) - from Figma Design System
  gray: {
    50: '#f6f6f6',
    100: '#e4e4e4',
    200: '#cacaca',
    300: '#afafaf',
    400: '#959595',
    500: '#7a7a7a',
    600: '#6e6e6e',
    700: '#626262',
    800: '#494949',
    900: '#313131',
    950: '#1a1a1a',
  },

  // Semantic colors - Success (Green) - from Figma Design System
  success: {
    50: '#ebf8f0',
    100: '#d1f2dd',
    200: '#a3e5bb',
    300: '#75d799',
    400: '#47ca77',
    500: '#30c466', // Main success
    600: '#16aa4d',
    700: '#149744',
    800: '#0f7133',
    900: '#0a4c22',
    950: '#052611',
  },

  // Warning (Orange/Yellow)
  warning: {
    50: '#fef9e7',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error (Red) - from Figma Design System
  error: {
    50: '#f9f0f0',
    100: '#f4d2d2',
    200: '#eaa5a5',
    300: '#df7878',
    400: '#d44b4b',
    500: '#ca1f1f', // Main error
    600: '#b51b1b',
    700: '#a11818',
    800: '#791212',
    900: '#510c0c',
    950: '#280606',
  },

  // Info (Blue - uses primary palette)
  info: {
    50: '#e8eaf8',
    100: '#d0d5f0',
    200: '#a1abe1',
    300: '#7380d3',
    400: '#4456c4',
    500: '#2c41bc',
    600: '#152cb5',
    700: '#112391',
    800: '#0d1a6d',
    900: '#081248',
    950: '#040924',
  },

  // Alert-specific colors
  alert: {
    background: '#ca1f1f',
    text: '#ffffff',
    pulse: '#d44b4b',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorPalette = typeof colors;
