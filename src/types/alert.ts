import { Database } from './database';

export type AlertRow = Database['public']['Tables']['alerts']['Row'];
export type AlertInsert = Database['public']['Tables']['alerts']['Insert'];
export type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

export type AlertType = Database['public']['Enums']['alert_type'];
export type AlertStatus = Database['public']['Enums']['alert_status'];

export interface TriggerAlertInput {
  tripId?: string;
  type: AlertType;
  reason?: string;
  lat?: number;
  lng?: number;
  batteryLevel?: number;
}

export interface AlertPayload {
  alertId: string;
  userId: string;
  userName: string;
  type: AlertType;
  reason?: string;
  location?: {
    lat: number;
    lng: number;
  };
  batteryLevel?: number;
  triggeredAt: string;
}

export interface NotifyContactsResult {
  notifiedCount: number;
  failures: Array<{
    contactId: string;
    error: string;
  }>;
}
