import { env } from '@/src/config/env';

interface LatLng {
  lat: number;
  lng: number;
}

interface RouteStep {
  instruction: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startLocation: LatLng;
  endLocation: LatLng;
}

interface DecodedRoute {
  polyline: { latitude: number; longitude: number }[];
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  steps: RouteStep[];
}

type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

const DIRECTIONS_API_URL =
  'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Decode Google Maps encoded polyline string into coordinate array.
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export async function fetchDirections(
  origin: LatLng,
  destination: LatLng,
  mode: TravelMode = 'driving',
): Promise<DecodedRoute | null> {
  if (!env.googleMapsApiKey) {
    return null;
  }

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode,
    key: env.googleMapsApiKey,
    language: 'fr',
  });

  const response = await fetch(`${DIRECTIONS_API_URL}?${params.toString()}`);

  if (!response.ok) {
    return null;
  }

  const data: DirectionsApiResponse = await response.json();

  if (data.status !== 'OK' || data.routes.length === 0) {
    return null;
  }

  const route = data.routes[0];
  if (!route) return null;
  const leg = route.legs[0];
  if (!leg) return null;

  const polyline = decodePolyline(route.overview_polyline.points);

  const steps: RouteStep[] = leg.steps.map((step) => ({
    instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
    distance: step.distance,
    duration: step.duration,
    startLocation: {
      lat: step.start_location.lat,
      lng: step.start_location.lng,
    },
    endLocation: {
      lat: step.end_location.lat,
      lng: step.end_location.lng,
    },
  }));

  return {
    polyline,
    distance: leg.distance,
    duration: leg.duration,
    steps,
  };
}

// Google Directions API response types (only what we need)
interface DirectionsApiResponse {
  status: string;
  routes: Array<{
    overview_polyline: { points: string };
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        start_location: { lat: number; lng: number };
        end_location: { lat: number; lng: number };
      }>;
    }>;
  }>;
}

export type { LatLng, DecodedRoute, RouteStep, TravelMode };
