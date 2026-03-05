import { env } from '@/src/config/env';

interface LatLng {
  lat: number;
  lng: number;
}

type TransitVehicleType =
  | 'BUS'
  | 'SUBWAY'
  | 'TRAIN'
  | 'TRAM'
  | 'RAIL'
  | 'FERRY'
  | 'CABLE_CAR'
  | 'GONDOLA_LIFT'
  | 'FUNICULAR'
  | 'OTHER';

interface TransitStop {
  name: string;
  location: LatLng;
}

interface TransitLine {
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  vehicleType: TransitVehicleType;
}

interface TransitDetails {
  departureStop: TransitStop;
  arrivalStop: TransitStop;
  line: TransitLine;
  numStops: number;
  headSign: string;
}

type StepTravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

interface RouteStep {
  instruction: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startLocation: LatLng;
  endLocation: LatLng;
  travelMode: StepTravelMode;
  transitDetails?: TransitDetails;
  polyline: { latitude: number; longitude: number }[];
}

interface RouteSegment {
  coordinates: { latitude: number; longitude: number }[];
  color: string;
  isDashed: boolean;
}

interface DecodedRoute {
  polyline: { latitude: number; longitude: number }[];
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  steps: RouteStep[];
  summary: string;
  index: number;
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

function parseTransitDetails(
  raw: DirectionsApiTransitDetails,
): TransitDetails {
  return {
    departureStop: {
      name: raw.departure_stop.name,
      location: raw.departure_stop.location,
    },
    arrivalStop: {
      name: raw.arrival_stop.name,
      location: raw.arrival_stop.location,
    },
    line: {
      name: raw.line.name ?? '',
      shortName: raw.line.short_name ?? '',
      color: raw.line.color ?? '#888888',
      textColor: raw.line.text_color ?? '#ffffff',
      vehicleType: (raw.line.vehicle?.type ?? 'OTHER') as TransitVehicleType,
    },
    numStops: raw.num_stops,
    headSign: raw.headsign ?? '',
  };
}

function decodeStep(raw: DirectionsApiStep): RouteStep {
  const polyline = raw.polyline?.points
    ? decodePolyline(raw.polyline.points)
    : [
        { latitude: raw.start_location.lat, longitude: raw.start_location.lng },
        { latitude: raw.end_location.lat, longitude: raw.end_location.lng },
      ];

  const step: RouteStep = {
    instruction: raw.html_instructions.replace(/<[^>]*>/g, ''),
    distance: raw.distance,
    duration: raw.duration,
    startLocation: {
      lat: raw.start_location.lat,
      lng: raw.start_location.lng,
    },
    endLocation: {
      lat: raw.end_location.lat,
      lng: raw.end_location.lng,
    },
    travelMode: raw.travel_mode,
    polyline,
  };

  if (raw.transit_details) {
    step.transitDetails = parseTransitDetails(raw.transit_details);
  }

  return step;
}

function decodeRoute(
  raw: DirectionsApiRoute,
  index: number,
): DecodedRoute | null {
  const leg = raw.legs[0];
  if (!leg) return null;

  return {
    polyline: decodePolyline(raw.overview_polyline.points),
    distance: leg.distance,
    duration: leg.duration,
    steps: leg.steps.map(decodeStep),
    summary: raw.summary ?? '',
    index,
  };
}

const MAX_TRANSIT_ROUTES = 4;
const TRANSIT_OFFSET_SECONDS = 15 * 60;

async function fetchDirectionsBatch(
  origin: LatLng,
  destination: LatLng,
  mode: TravelMode,
  departureTime?: number,
): Promise<DirectionsApiRoute[]> {
  if (!env.googleMapsApiKey) return [];

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode,
    alternatives: 'true',
    key: env.googleMapsApiKey,
    language: 'fr',
  });

  if (departureTime) {
    params.set('departure_time', String(departureTime));
  }

  const response = await fetch(`${DIRECTIONS_API_URL}?${params.toString()}`);
  if (!response.ok) return [];

  const data: DirectionsApiResponse = await response.json();
  if (data.status !== 'OK') return [];

  return data.routes;
}

/**
 * Deduplicate routes by duration — two routes with the same total
 * duration in seconds are considered duplicates.
 */
function deduplicateRoutes(routes: DecodedRoute[]): DecodedRoute[] {
  const seen = new Set<number>();
  return routes.filter((r) => {
    if (seen.has(r.duration.value)) return false;
    seen.add(r.duration.value);
    return true;
  });
}

export async function fetchDirectionsMultiple(
  origin: LatLng,
  destination: LatLng,
  mode: TravelMode = 'driving',
): Promise<DecodedRoute[]> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const rawRoutes = await fetchDirectionsBatch(
    origin,
    destination,
    mode,
    mode === 'transit' ? nowSeconds : undefined,
  );

  let allRaw = [...rawRoutes];

  // For transit: if we have fewer than 4, do a second call +15 min later
  if (mode === 'transit' && allRaw.length < MAX_TRANSIT_ROUTES) {
    const extraRoutes = await fetchDirectionsBatch(
      origin,
      destination,
      mode,
      nowSeconds + TRANSIT_OFFSET_SECONDS,
    );
    allRaw = [...allRaw, ...extraRoutes];
  }

  const decoded: DecodedRoute[] = [];
  for (let i = 0; i < allRaw.length; i++) {
    const route = decodeRoute(allRaw[i]!, i);
    if (route) decoded.push(route);
  }

  const unique = deduplicateRoutes(decoded);

  // Re-index after dedup
  const result = unique.slice(0, mode === 'transit' ? MAX_TRANSIT_ROUTES : unique.length);
  return result.map((r, i) => ({ ...r, index: i }));
}

export async function fetchDirections(
  origin: LatLng,
  destination: LatLng,
  mode: TravelMode = 'driving',
): Promise<DecodedRoute | null> {
  const routes = await fetchDirectionsMultiple(origin, destination, mode);
  return routes[0] ?? null;
}

// Google Directions API response types
interface DirectionsApiTransitDetails {
  departure_stop: { name: string; location: LatLng };
  arrival_stop: { name: string; location: LatLng };
  line: {
    name?: string;
    short_name?: string;
    color?: string;
    text_color?: string;
    vehicle?: { type?: string };
  };
  num_stops: number;
  headsign?: string;
}

interface DirectionsApiStep {
  html_instructions: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  travel_mode: StepTravelMode;
  transit_details?: DirectionsApiTransitDetails;
  polyline?: { points: string };
}

interface DirectionsApiRoute {
  overview_polyline: { points: string };
  summary?: string;
  legs: Array<{
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    steps: DirectionsApiStep[];
  }>;
}

interface DirectionsApiResponse {
  status: string;
  routes: DirectionsApiRoute[];
}

const WALKING_COLOR = '#959595';
const DEFAULT_ROUTE_COLOR = '#2c41bc';

function buildRouteSegments(route: DecodedRoute): RouteSegment[] {
  return route.steps.map((step) => {
    if (step.travelMode === 'WALKING') {
      return { coordinates: step.polyline, color: WALKING_COLOR, isDashed: true };
    }
    if (step.travelMode === 'TRANSIT' && step.transitDetails) {
      return { coordinates: step.polyline, color: step.transitDetails.line.color, isDashed: false };
    }
    return { coordinates: step.polyline, color: DEFAULT_ROUTE_COLOR, isDashed: false };
  });
}

export { buildRouteSegments };

export type {
  LatLng,
  DecodedRoute,
  RouteStep,
  RouteSegment,
  TravelMode,
  TransitDetails,
  TransitStop,
  TransitLine,
  TransitVehicleType,
  StepTravelMode,
};
