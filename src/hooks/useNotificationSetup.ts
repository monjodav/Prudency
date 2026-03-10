import { useEffect } from 'react';
import { router } from 'expo-router';
import { useNotifications } from './useNotifications';
import { useAuthStore } from '@/src/stores/authStore';

export function useNotificationSetup() {
  const session = useAuthStore((s) => s.session);
  const {
    registerForPushNotifications,
    onNotificationResponse,
  } = useNotifications();

  useEffect(() => {
    if (session) {
      registerForPushNotifications();
    }
  }, [session, registerForPushNotifications]);

  useEffect(() => {
    if (!session) return;

    const cleanup = onNotificationResponse((response) => {
      const raw = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (!raw) return;

      const type = typeof raw.type === 'string' ? raw.type : undefined;

      switch (type) {
        case 'trip_started':
        case 'approaching_arrival':
        case 'overtime':
        case 'check_in_reminder':
        case 'alert_acknowledged':
        case 'anomaly_detected':
        case 'battery_low':
        case 'connection_status':
          router.push('/(trip)/active');
          break;
        case 'alert_triggered':
        case 'contact_alert':
        case 'alert_comment':
          router.push('/(trip)/alert-active');
          break;
        case 'contact_trip_started':
        case 'contact_timeout':
          router.push('/(guardian)/track');
          break;
        case 'trip_completed':
        case 'contact_arrival':
          router.push('/(tabs)');
          break;
        case 'validation_required':
        case 'contact_accepted':
        case 'contact_refused':
          router.push('/(tabs)/contacts');
          break;
        default:
          break;
      }
    });

    return cleanup;
  }, [session, onNotificationResponse]);
}
