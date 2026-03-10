import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import * as notificationService from '@/src/services/notificationService';
import type { NotificationRow, NotificationType, NotificationData } from '@/src/types/notification';

const NOTIFICATIONS_KEY = ['notifications'] as const;
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;
const DEVICE_NOTIFICATIONS_KEY = ['notifications', 'device'] as const;

const VALID_TYPES = new Set<string>([
  'trip_started', 'approaching_arrival', 'overtime', 'alert_triggered',
  'alert_acknowledged', 'trip_completed', 'contact_trip_started',
  'contact_alert', 'contact_arrival', 'contact_timeout',
  'anomaly_detected', 'battery_low', 'check_in_reminder', 'connection_status',
  'contact_accepted', 'contact_refused', 'alert_comment', 'validation_required',
]);

function deviceNotificationToRow(n: Notifications.Notification): NotificationRow {
  const rawData = (n.request.content.data ?? {}) as Record<string, unknown>;
  const rawType = typeof rawData.type === 'string' ? rawData.type : '';
  const type: NotificationType = VALID_TYPES.has(rawType)
    ? (rawType as NotificationType)
    : 'trip_started';

  return {
    id: `device-${n.request.identifier}`,
    user_id: '',
    type,
    title: n.request.content.title ?? null,
    body: n.request.content.body ?? null,
    data: rawData as NotificationData,
    read: false,
    created_at: new Date(n.date).toISOString(),
  };
}

export function useNotificationsQuery(limit = 20, offset = 0) {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  // DB notifications
  const notificationsQuery = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, limit, offset],
    queryFn: () => notificationService.getNotifications(limit, offset),
    enabled: !!session,
    staleTime: 30_000,
  });

  // Device-delivered notifications (from notification center)
  const deviceQuery = useQuery({
    queryKey: [...DEVICE_NOTIFICATIONS_KEY],
    queryFn: async () => {
      const delivered = await Notifications.getPresentedNotificationsAsync();
      return delivered.map(deviceNotificationToRow);
    },
    staleTime: 10_000,
  });

  const unreadCountQuery = useQuery({
    queryKey: [...UNREAD_COUNT_KEY],
    queryFn: notificationService.getUnreadCount,
    enabled: !!session,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, queryClient]);

  const markAsRead = useMutation({
    mutationFn: notificationService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await notificationService.markAllNotificationsRead();
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.setBadgeCountAsync(0);
    },
    onMutate: () => {
      queryClient.setQueryData(UNREAD_COUNT_KEY, 0);
      queryClient.setQueryData(DEVICE_NOTIFICATIONS_KEY, []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: DEVICE_NOTIFICATIONS_KEY });
    },
  });

  // Merge DB + device notifications, deduplicate, sort by date
  const dbNotifications = notificationsQuery.data ?? [];
  const deviceNotifications = deviceQuery.data ?? [];

  const dbIds = new Set(dbNotifications.map((n) => n.id));
  const deviceOnly = deviceNotifications.filter((n) => !dbIds.has(n.id));
  const merged = [
    ...dbNotifications,
    ...deviceOnly,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    notifications: merged,
    isLoading: notificationsQuery.isLoading && deviceQuery.isLoading,
    error: notificationsQuery.error,
    unreadCount: (unreadCountQuery.data ?? 0) + deviceOnly.length,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    refetch: () => {
      notificationsQuery.refetch();
      deviceQuery.refetch();
    },
  };
}
