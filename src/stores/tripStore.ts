import { create } from 'zustand';

interface TripState {
  activeTripId: string | null;
  isTracking: boolean;
  lastKnownLat: number | null;
  lastKnownLng: number | null;
  batteryLevel: number | null;
  setActiveTrip: (tripId: string | null) => void;
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
  setActiveTrip: (activeTripId) => set({ activeTripId }),
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
    }),
}));
