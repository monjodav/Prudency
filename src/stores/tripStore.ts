import { create } from 'zustand';
import type { TrackingMode } from '@/src/utils/trackingStrategy';
import type { DecodedRoute, RouteSegment, RouteStep } from '@/src/services/directionsService';
import type { TransportMode } from '@/src/hooks/useTripCreation';

interface TripState {
  activeTripId: string | null;
  isTracking: boolean;
  trackingMode: TrackingMode;
  isAlerted: boolean;
  lastKnownLat: number | null;
  lastKnownLng: number | null;
  batteryLevel: number | null;
  arrivalAddress: string | null;
  estimatedDurationMinutes: number | null;
  routeData: DecodedRoute | null;
  routeSegments: RouteSegment[] | null;
  routeSteps: RouteStep[] | null;
  transportMode: TransportMode | null;
  departureLoc: { lat: number; lng: number } | null;
  setActiveTrip: (tripId: string | null) => void;
  setTripDetails: (details: { arrivalAddress?: string; estimatedDurationMinutes?: number }) => void;
  setTracking: (tracking: boolean) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  setAlerted: (alerted: boolean) => void;
  updateLocation: (lat: number, lng: number) => void;
  setBatteryLevel: (level: number) => void;
  setRouteData: (route: DecodedRoute, segments: RouteSegment[]) => void;
  setTransportMode: (mode: TransportMode) => void;
  setDepartureLoc: (loc: { lat: number; lng: number }) => void;
  reset: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTripId: null,
  isTracking: false,
  trackingMode: 'idle',
  isAlerted: false,
  lastKnownLat: null,
  lastKnownLng: null,
  batteryLevel: null,
  arrivalAddress: null,
  estimatedDurationMinutes: null,
  routeData: null,
  routeSegments: null,
  routeSteps: null,
  transportMode: null,
  departureLoc: null,
  setActiveTrip: (activeTripId) => set({ activeTripId }),
  setTripDetails: (details) =>
    set({
      arrivalAddress: details.arrivalAddress ?? null,
      estimatedDurationMinutes: details.estimatedDurationMinutes ?? null,
    }),
  setTracking: (isTracking) => set({ isTracking }),
  setTrackingMode: (trackingMode) => set({ trackingMode }),
  setAlerted: (isAlerted) => set({ isAlerted }),
  updateLocation: (lat, lng) => set({ lastKnownLat: lat, lastKnownLng: lng }),
  setBatteryLevel: (batteryLevel) => set({ batteryLevel }),
  setRouteData: (route, segments) =>
    set({ routeData: route, routeSegments: segments, routeSteps: route.steps }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setDepartureLoc: (departureLoc) => set({ departureLoc }),
  reset: () =>
    set({
      activeTripId: null,
      isTracking: false,
      trackingMode: 'idle',
      isAlerted: false,
      lastKnownLat: null,
      lastKnownLng: null,
      batteryLevel: null,
      arrivalAddress: null,
      estimatedDurationMinutes: null,
      routeData: null,
      routeSegments: null,
      routeSteps: null,
      transportMode: null,
      departureLoc: null,
    }),
}));
