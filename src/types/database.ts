export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          auth_provider: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          status: 'draft' | 'active' | 'completed' | 'cancelled' | 'timeout' | 'alerted';
          departure_address: string | null;
          departure_lat: number | null;
          departure_lng: number | null;
          arrival_address: string | null;
          arrival_lat: number | null;
          arrival_lng: number | null;
          estimated_duration_minutes: number;
          started_at: string | null;
          estimated_arrival_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'timeout' | 'alerted';
          departure_address?: string | null;
          departure_lat?: number | null;
          departure_lng?: number | null;
          arrival_address?: string | null;
          arrival_lat?: number | null;
          arrival_lng?: number | null;
          estimated_duration_minutes: number;
          started_at?: string | null;
          estimated_arrival_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled' | 'timeout' | 'alerted';
          departure_address?: string | null;
          departure_lat?: number | null;
          departure_lng?: number | null;
          arrival_address?: string | null;
          arrival_lat?: number | null;
          arrival_lng?: number | null;
          estimated_duration_minutes?: number;
          started_at?: string | null;
          estimated_arrival_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          trip_id: string | null;
          user_id: string;
          type: 'manual' | 'automatic' | 'timeout';
          status: 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm';
          reason: string | null;
          triggered_at: string;
          triggered_lat: number | null;
          triggered_lng: number | null;
          battery_level: number | null;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          user_id: string;
          type: 'manual' | 'automatic' | 'timeout';
          status?: 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm';
          reason?: string | null;
          triggered_at?: string;
          triggered_lat?: number | null;
          triggered_lng?: number | null;
          battery_level?: number | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          user_id?: string;
          type?: 'manual' | 'automatic' | 'timeout';
          status?: 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm';
          reason?: string | null;
          triggered_at?: string;
          triggered_lat?: number | null;
          triggered_lng?: number | null;
          battery_level?: number | null;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
      trusted_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          email: string | null;
          is_primary: boolean;
          notify_by_push: boolean;
          notify_by_sms: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          email?: string | null;
          is_primary?: boolean;
          notify_by_push?: boolean;
          notify_by_sms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          is_primary?: boolean;
          notify_by_push?: boolean;
          notify_by_sms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_notes: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          content: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          content: string;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          content?: string;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
      };
      trip_locations: {
        Row: {
          id: string;
          trip_id: string;
          lat: number;
          lng: number;
          accuracy: number | null;
          speed: number | null;
          heading: number | null;
          battery_level: number | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          lat: number;
          lng: number;
          accuracy?: number | null;
          speed?: number | null;
          heading?: number | null;
          battery_level?: number | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          lat?: number;
          lng?: number;
          accuracy?: number | null;
          speed?: number | null;
          heading?: number | null;
          battery_level?: number | null;
          recorded_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trip_status: 'draft' | 'active' | 'completed' | 'cancelled' | 'timeout' | 'alerted';
      alert_type: 'manual' | 'automatic' | 'timeout';
      alert_status: 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm';
    };
  };
};
