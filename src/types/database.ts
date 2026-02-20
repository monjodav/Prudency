export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          battery_level: number | null
          created_at: string | null
          id: string
          reason: string | null
          resolved_at: string | null
          status: AlertStatus | null
          triggered_at: string | null
          triggered_lat: number | null
          triggered_lng: number | null
          trip_id: string
          type: AlertType
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          battery_level?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: AlertStatus | null
          triggered_at?: string | null
          triggered_lat?: number | null
          triggered_lng?: number | null
          trip_id: string
          type: AlertType
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          battery_level?: number | null
          created_at?: string | null
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: AlertStatus | null
          triggered_at?: string | null
          triggered_lat?: number | null
          triggered_lng?: number | null
          trip_id?: string
          type?: AlertType
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'alerts_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alerts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          phone_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          address: string
          created_at: string | null
          icon: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          place_type: PlaceType | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          icon?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          place_type?: PlaceType | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          place_type?: PlaceType | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_places_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      trip_locations: {
        Row: {
          accuracy: number | null
          battery_level: number | null
          heading: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string | null
          speed: number | null
          trip_id: string
        }
        Insert: {
          accuracy?: number | null
          battery_level?: number | null
          heading?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string | null
          speed?: number | null
          trip_id: string
        }
        Update: {
          accuracy?: number | null
          battery_level?: number | null
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string | null
          speed?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trip_locations_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
        ]
      }
      trip_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_encrypted: boolean | null
          lat: number | null
          lng: number | null
          trip_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          lat?: number | null
          lng?: number | null
          trip_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_encrypted?: boolean | null
          lat?: number | null
          lng?: number | null
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'trip_notes_trip_id_fkey'
            columns: ['trip_id']
            isOneToOne: false
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trip_notes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      trips: {
        Row: {
          arrival_address: string | null
          arrival_lat: number | null
          arrival_lng: number | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          departure_address: string | null
          departure_lat: number | null
          departure_lng: number | null
          estimated_arrival_at: string | null
          estimated_duration_minutes: number | null
          id: string
          paused_at: string | null
          started_at: string | null
          status: TripStatus | null
          transport_mode: TransportMode | null
          trusted_contact_id: string | null
          updated_at: string | null
          user_id: string
          validated_at: string | null
          validation_code: string | null
        }
        Insert: {
          arrival_address?: string | null
          arrival_lat?: number | null
          arrival_lng?: number | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          departure_address?: string | null
          departure_lat?: number | null
          departure_lng?: number | null
          estimated_arrival_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          paused_at?: string | null
          started_at?: string | null
          status?: TripStatus | null
          transport_mode?: TransportMode | null
          trusted_contact_id?: string | null
          updated_at?: string | null
          user_id: string
          validated_at?: string | null
          validation_code?: string | null
        }
        Update: {
          arrival_address?: string | null
          arrival_lat?: number | null
          arrival_lng?: number | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          departure_address?: string | null
          departure_lat?: number | null
          departure_lng?: number | null
          estimated_arrival_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          paused_at?: string | null
          started_at?: string | null
          status?: TripStatus | null
          transport_mode?: TransportMode | null
          trusted_contact_id?: string | null
          updated_at?: string | null
          user_id?: string
          validated_at?: string | null
          validation_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'trips_trusted_contact_id_fkey'
            columns: ['trusted_contact_id']
            isOneToOne: false
            referencedRelation: 'trusted_contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trips_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      trusted_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          invitation_count: number
          invitation_sent_at: string | null
          invitation_token: string | null
          is_favorite: boolean
          is_primary: boolean | null
          name: string
          notify_by_push: boolean | null
          notify_by_sms: boolean | null
          phone: string
          relation: string | null
          updated_at: string | null
          user_id: string
          validation_status: 'pending' | 'accepted' | 'refused'
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          invitation_token?: string | null
          is_favorite?: boolean
          is_primary?: boolean | null
          name: string
          notify_by_push?: boolean | null
          notify_by_sms?: boolean | null
          phone: string
          relation?: string | null
          updated_at?: string | null
          user_id: string
          validation_status?: 'pending' | 'accepted' | 'refused'
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_count?: number
          invitation_sent_at?: string | null
          invitation_token?: string | null
          is_favorite?: boolean
          is_primary?: boolean | null
          name?: string
          notify_by_push?: boolean | null
          notify_by_sms?: boolean | null
          phone?: string
          relation?: string | null
          updated_at?: string | null
          user_id?: string
          validation_status?: 'pending' | 'accepted' | 'refused'
        }
        Relationships: [
          {
            foreignKeyName: 'trusted_contacts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      trip_status: TripStatus
      transport_mode: TransportMode
      alert_type: AlertType
      alert_status: AlertStatus
      place_type: PlaceType
    }
  }
}

// Enum literal types (DB uses TEXT + CHECK, not PG enums)
export type TripStatus = 'draft' | 'active' | 'scheduled' | 'paused' | 'completed' | 'cancelled' | 'timeout' | 'alerted' | 'alert'
export type TransportMode = 'walk' | 'car' | 'transit' | 'bike' | 'other'
export type AlertType = 'manual' | 'automatic' | 'timeout' | 'inactivity' | 'deviation'
export type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm'
export type PlaceType = 'home' | 'work' | 'favorite' | 'other'

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type TrustedContact = Tables<'trusted_contacts'>
export type SavedPlace = Tables<'saved_places'>
export type Trip = Tables<'trips'>
export type TripLocation = Tables<'trip_locations'>
export type TripNote = Tables<'trip_notes'>
export type Alert = Tables<'alerts'>

export type ProfileInsert = TablesInsert<'profiles'>
export type TrustedContactInsert = TablesInsert<'trusted_contacts'>
export type SavedPlaceInsert = TablesInsert<'saved_places'>
export type TripInsert = TablesInsert<'trips'>
export type TripLocationInsert = TablesInsert<'trip_locations'>
export type TripNoteInsert = TablesInsert<'trip_notes'>
export type AlertInsert = TablesInsert<'alerts'>

export type ProfileUpdate = TablesUpdate<'profiles'>
export type TrustedContactUpdate = TablesUpdate<'trusted_contacts'>
export type SavedPlaceUpdate = TablesUpdate<'saved_places'>
export type TripUpdate = TablesUpdate<'trips'>
export type TripLocationUpdate = TablesUpdate<'trip_locations'>
export type TripNoteUpdate = TablesUpdate<'trip_notes'>
export type AlertUpdate = TablesUpdate<'alerts'>
