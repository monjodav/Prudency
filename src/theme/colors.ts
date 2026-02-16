export const colors = {
  // Primary colors
  primary: {
    50: '#FFF0F5',
    100: '#FFE0EB',
    200: '#FFC1D7',
    300: '#FFA2C3',
    400: '#FF83AF',
    500: '#FF649B', // Main primary
    600: '#E65A8B',
    700: '#CC507B',
    800: '#B3466B',
    900: '#993C5B',
  },

  // Secondary colors
  secondary: {
    50: '#F5F0FF',
    100: '#EBE0FF',
    200: '#D7C1FF',
    300: '#C3A2FF',
    400: '#AF83FF',
    500: '#9B64FF', // Main secondary
    600: '#8B5AE6',
    700: '#7B50CC',
    800: '#6B46B3',
    900: '#5B3C99',
  },

  // Neutrals
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#2E7D32',
  },
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
    light: '#FFF3E0',
    main: '#FF9800',
    dark: '#E65100',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#C62828',
  },
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
    light: '#E3F2FD',
    main: '#2196F3',
    dark: '#1565C0',
  },

  // Alert-specific colors
  alert: {
    background: '#FF0000',
    text: '#FFFFFF',
    pulse: '#FF4444',
  },

  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorPalette = typeof colors;
