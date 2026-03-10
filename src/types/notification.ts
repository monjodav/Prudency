export type NotificationType =
  | 'trip_started'
  | 'approaching_arrival'
  | 'overtime'
  | 'alert_triggered'
  | 'alert_acknowledged'
  | 'trip_completed'
  | 'contact_trip_started'
  | 'contact_alert'
  | 'contact_arrival'
  | 'contact_timeout'
  | 'anomaly_detected'
  | 'battery_low'
  | 'check_in_reminder'
  | 'connection_status'
  | 'contact_accepted'
  | 'contact_refused'
  | 'alert_comment'
  | 'validation_required';

export interface NotificationData {
  type?: NotificationType;
  tripId?: string;
  alertId?: string;
  contactName?: string;
  destination?: string;
  [key: string]: unknown;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string | null;
  body: string | null;
  data: NotificationData;
  read: boolean;
  created_at: string;
}
