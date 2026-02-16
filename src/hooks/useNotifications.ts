import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as notificationService from '@/src/services/notificationService';
import { useAuthStore } from '@/src/stores/authStore';
import { requestNotificationPermission } from '@/src/utils/permissions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const session = useAuthStore((s) => s.session);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerForPushNotifications = useCallback(async () => {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId && Platform.OS !== 'web') {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId ?? undefined,
      });
      const token = tokenData.data;

      if (session) {
        await notificationService.registerPushToken(token);
      }

      return token;
    } catch {
      return null;
    }
  }, [session]);

  const onNotificationReceived = useCallback(
    (handler: (notification: Notifications.Notification) => void) => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      notificationListener.current =
        Notifications.addNotificationReceivedListener(handler);
    },
    []
  );

  const onNotificationResponse = useCallback(
    (handler: (response: Notifications.NotificationResponse) => void) => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(handler);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    registerForPushNotifications,
    onNotificationReceived,
    onNotificationResponse,
  };
}
