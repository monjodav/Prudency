import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import type { NotificationRow } from '@/src/types/notification';

export async function registerPushToken(token: string): Promise<void> {
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { error } = await supabase.functions.invoke('register-push-token', {
    body: { token, platform: Platform.OS },
  });

  if (error) {
    throw error;
  }
}

export async function getNotifications(
  limit = 20,
  offset = 0,
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return (data ?? []) as NotificationRow[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false);

  if (error) {
    throw error;
  }
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
