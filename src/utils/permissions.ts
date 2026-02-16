import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionsState {
  location: PermissionStatus;
  locationBackground: PermissionStatus;
  notifications: PermissionStatus;
}

export async function checkLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return mapExpoStatus(status);
}

export async function checkBackgroundLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.getBackgroundPermissionsAsync();
  return mapExpoStatus(status);
}

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return mapExpoStatus(status);
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return mapExpoStatus(status);
}

export async function requestBackgroundLocationPermission(): Promise<PermissionStatus> {
  const foreground = await requestLocationPermission();
  if (foreground !== 'granted') {
    return foreground;
  }
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return mapExpoStatus(status);
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowCriticalAlerts: true,
    },
  });
  return mapExpoStatus(status);
}

export async function getAllPermissions(): Promise<PermissionsState> {
  const [location, locationBackground, notifications] = await Promise.all([
    checkLocationPermission(),
    checkBackgroundLocationPermission(),
    checkNotificationPermission(),
  ]);

  return {
    location,
    locationBackground,
    notifications,
  };
}

export async function requestAllPermissions(): Promise<PermissionsState> {
  const notifications = await requestNotificationPermission();
  const location = await requestLocationPermission();

  let locationBackground: PermissionStatus = 'undetermined';
  if (location === 'granted') {
    locationBackground = await requestBackgroundLocationPermission();
  }

  return {
    location,
    locationBackground,
    notifications,
  };
}

export function areEssentialPermissionsGranted(state: PermissionsState): boolean {
  return state.location === 'granted' && state.notifications === 'granted';
}

export function getPermissionMessage(permission: keyof PermissionsState): string {
  const messages: Record<keyof PermissionsState, string> = {
    location: 'La localisation est nécessaire pour suivre votre trajet et envoyer votre position en cas d\'alerte.',
    locationBackground: 'La localisation en arrière-plan permet de continuer le suivi même si l\'app est fermée.',
    notifications: 'Les notifications vous alertent quand vous approchez de l\'heure d\'arrivée prévue.',
  };
  return messages[permission];
}

function mapExpoStatus(
  status: Location.PermissionStatus | Notifications.PermissionStatus
): PermissionStatus {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}

export function canOpenSettings(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
