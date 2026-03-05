interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Haversine distance between two lat/lng points in meters.
 */
export function distanceToDestination(current: LatLng, destination: LatLng): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(destination.lat - current.lat);
  const dLng = toRad(destination.lng - current.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h =
    sinLat * sinLat +
    Math.cos(toRad(current.lat)) * Math.cos(toRad(destination.lat)) * sinLng * sinLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}
