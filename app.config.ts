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
      NSPhotoLibraryUsageDescription:
        'Prudency a besoin d\'accéder à tes photos pour changer ta photo de profil.',
      NSCameraUsageDescription:
        'Prudency a besoin d\'accéder à ta caméra pour prendre une photo de profil.',
      NSContactsUsageDescription:
        'Prudency a besoin d\'accéder à tes contacts pour ajouter des contacts de confiance.',
      UIBackgroundModes: ['remote-notification'],
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
      'POST_NOTIFICATIONS',
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
    [
      'expo-image-picker',
      {
        photosPermission:
          'Prudency a besoin d\'accéder à tes photos pour changer ta photo de profil.',
        cameraPermission:
          'Prudency a besoin d\'accéder à ta caméra pour prendre une photo de profil.',
      },
    ],
    [
      'expo-contacts',
      {
        contactsPermission:
          'Prudency a besoin d\'accéder à tes contacts pour ajouter des contacts de confiance.',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#040924',
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: 'com.googleusercontent.apps.796381017761-kd9frcgmvmjeef78h7101qheuh9svig6',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
