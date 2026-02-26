import { ExpoConfig, ConfigContext } from 'expo/config';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'prudency',
  slug: 'prudency',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'prudency',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#040924',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.prudency.app',
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Prudency a besoin de ta localisation pour suivre ton trajet et assurer ta sécurité.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Prudency a besoin de ta localisation en arrière-plan pour continuer à surveiller ton trajet.',
      NSLocationAlwaysUsageDescription:
        'Prudency a besoin de ta localisation en arrière-plan pour continuer à surveiller ton trajet.',
    },
  },
  android: {
    package: 'com.prudency.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static' as const,
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Prudency a besoin de ta localisation pour suivre ton trajet et assurer ta sécurité.',
        locationAlwaysPermission:
          'Prudency a besoin de ta localisation en arrière-plan pour continuer à surveiller ton trajet.',
        locationWhenInUsePermission:
          'Prudency a besoin de ta localisation pour suivre ton trajet.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
