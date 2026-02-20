import { Database } from './database';

export type TripRow = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type TripStatus = Database['public']['Enums']['trip_status'];

export type TripLocationRow = Database['public']['Tables']['trip_locations']['Row'];

export interface ClientLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
}

export interface ActiveTripState {
  trip: TripRow;
  currentLocation: ClientLocation | null;
  remainingMinutes: number;
  isOvertime: boolean;
}
