import { useState, useCallback, useEffect } from 'react';
import {
  PermissionsState,
  getAllPermissions,
  requestAllPermissions,
  requestLocationPermission,
  requestBackgroundLocationPermission,
  requestNotificationPermission,
  areEssentialPermissionsGranted,
  getPermissionMessage,
} from '@/src/utils/permissions';

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: 'undetermined',
    locationBackground: 'undetermined',
    notifications: 'undetermined',
  });
  const [isChecking, setIsChecking] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsChecking(true);
    try {
      const state = await getAllPermissions();
      setPermissions(state);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestAll = useCallback(async () => {
    setIsChecking(true);
    try {
      const state = await requestAllPermissions();
      setPermissions(state);
      return state;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    const status = await requestLocationPermission();
    setPermissions((prev) => ({ ...prev, location: status }));
    return status;
  }, []);

  const requestBackgroundLocation = useCallback(async () => {
    const status = await requestBackgroundLocationPermission();
    setPermissions((prev) => ({ ...prev, locationBackground: status }));
    return status;
  }, []);

  const requestNotifications = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermissions((prev) => ({ ...prev, notifications: status }));
    return status;
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    isChecking,
    allEssentialGranted: areEssentialPermissionsGranted(permissions),
    checkPermissions,
    requestAll,
    requestLocation,
    requestBackgroundLocation,
    requestNotifications,
    getPermissionMessage,
  };
}
