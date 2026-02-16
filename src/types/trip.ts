import { Database } from './database';

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type TripStatus = Database['public']['Enums']['trip_status'];

export interface TripLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface TripCreateInput {
  estimatedDurationMinutes: number;
  departureAddress?: string;
  departureLat?: number;
  departureLng?: number;
  arrivalAddress?: string;
  arrivalLat?: number;
  arrivalLng?: number;
}

export interface ActiveTripState {
  trip: TripRow;
  currentLocation: TripLocation | null;
  remainingMinutes: number;
  isOvertime: boolean;
}
