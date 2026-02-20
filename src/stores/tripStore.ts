import { create } from 'zustand';

interface TripState {
  activeTripId: string | null;
  isTracking: boolean;
  lastKnownLat: number | null;
  lastKnownLng: number | null;
  batteryLevel: number | null;
  arrivalAddress: string | null;
  estimatedDurationMinutes: number | null;
  setActiveTrip: (tripId: string | null) => void;
  setTripDetails: (details: { arrivalAddress?: string; estimatedDurationMinutes?: number }) => void;
  setTracking: (tracking: boolean) => void;
  updateLocation: (lat: number, lng: number) => void;
  setBatteryLevel: (level: number) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTripId: null,
  isTracking: false,
  lastKnownLat: null,
  lastKnownLng: null,
  batteryLevel: null,
  arrivalAddress: null,
  estimatedDurationMinutes: null,
  setActiveTrip: (activeTripId) => set({ activeTripId }),
  setTripDetails: (details) =>
    set({
      arrivalAddress: details.arrivalAddress ?? null,
      estimatedDurationMinutes: details.estimatedDurationMinutes ?? null,
    }),
  setTracking: (isTracking) => set({ isTracking }),
  updateLocation: (lat, lng) => set({ lastKnownLat: lat, lastKnownLng: lng }),
  setBatteryLevel: (batteryLevel) => set({ batteryLevel }),
  reset: () =>
    set({
      activeTripId: null,
      isTracking: false,
      lastKnownLat: null,
      lastKnownLng: null,
      batteryLevel: null,
      arrivalAddress: null,
      estimatedDurationMinutes: null,
    }),
}));
