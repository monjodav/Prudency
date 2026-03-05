import type { AnomalyType } from '@/src/components/trip/AnomalyDialog';

/** Configurable thresholds for anomaly detection */
export interface AnomalyThresholds {
  /** Max distance in meters from planned route to flag a detour */
  routeDeviationMeters: number;
  /** Minutes past ETA before flagging overtime */
  overtimeMinutes: number;
  /** Minutes of immobility before flagging prolonged stop */
  prolongedStopMinutes: number;
  /** Min speed (m/s) below which user is considered stationary */
  stationarySpeedThreshold: number;
}

export const DEFAULT_THRESHOLDS: AnomalyThresholds = {
  routeDeviationMeters: 300,
  overtimeMinutes: 5,
  prolongedStopMinutes: 5,
  stationarySpeedThreshold: 0.5,
};

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Haversine distance between two points in meters.
 */
function haversineDistance(a: LatLng, b: Coordinate): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.lat);
  const dLng = toRad(b.longitude - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Find minimum distance from a point to a polyline (series of segments).
 */
export function distanceToPolyline(
  point: LatLng,
  polyline: Coordinate[],
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return haversineDistance(point, polyline[0]!);

  let minDist = Infinity;
  for (const coord of polyline) {
    const dist = haversineDistance(point, coord);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * Check if current position deviates from planned route.
 */
export function checkRouteDeviation(
  currentPosition: LatLng,
  routePolyline: Coordinate[],
  thresholdMeters: number,
): boolean {
  if (routePolyline.length === 0) return false;
  const distance = distanceToPolyline(currentPosition, routePolyline);
  return distance > thresholdMeters;
}

/**
 * Check if current time exceeds ETA + buffer.
 */
export function checkOvertime(
  estimatedArrivalAt: string | null,
  bufferMinutes: number,
): boolean {
  if (!estimatedArrivalAt) return false;
  const arrival = new Date(estimatedArrivalAt).getTime();
  const deadline = arrival + bufferMinutes * 60 * 1000;
  return Date.now() > deadline;
}

/**
 * Check if user has been stationary for too long.
 * Returns true when the position hasn't moved beyond a small radius
 * for longer than the threshold duration.
 */
export function checkProlongedStop(
  stationarySinceMs: number | null,
  thresholdMinutes: number,
): boolean {
  if (stationarySinceMs === null) return false;
  const elapsed = Date.now() - stationarySinceMs;
  return elapsed > thresholdMinutes * 60 * 1000;
}

/**
 * Determine if a position counts as stationary based on movement
 * from the last recorded stationary position.
 */
export function isStationary(
  currentPosition: LatLng,
  lastStationaryPosition: LatLng | null,
  speed: number | null | undefined,
  speedThreshold: number,
): boolean {
  if (speed != null && speed > speedThreshold) return false;
  if (!lastStationaryPosition) return true;

  const movedMeters = haversineDistance(currentPosition, {
    latitude: lastStationaryPosition.lat,
    longitude: lastStationaryPosition.lng,
  });

  return movedMeters < 30;
}

/**
 * Determine the most urgent anomaly type from detection results.
 */
export function resolveAnomalyType(flags: {
  isDeviation: boolean;
  isOvertime: boolean;
  isProlongedStop: boolean;
}): AnomalyType | null {
  if (flags.isDeviation) return 'route_deviation';
  if (flags.isOvertime) return 'overtime';
  if (flags.isProlongedStop) return 'prolonged_stop';
  return null;
}
