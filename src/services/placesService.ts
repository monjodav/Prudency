import * as Location from 'expo-location';
import { env } from '@/src/config/env';

interface LatLng {
  lat: number;
  lng: number;
}

interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL =
  'https://maps.googleapis.com/maps/api/place/details/json';
const GEOCODE_URL =
  'https://maps.googleapis.com/maps/api/geocode/json';

export async function searchPlaces(
  query: string,
  location?: LatLng,
): Promise<PlaceAutocompleteResult[]> {
  if (!query.trim() || !env.googleMapsApiKey) return [];

  const params = new URLSearchParams({
    input: query,
    key: env.googleMapsApiKey,
    language: 'fr',
    components: 'country:fr',
  });

  if (location) {
    params.set('location', `${location.lat},${location.lng}`);
    params.set('radius', '50000');
  }

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);

  if (!response.ok) return [];

  const data: AutocompleteApiResponse = await response.json();

  if (data.status !== 'OK') return [];

  return data.predictions.map((prediction) => ({
    placeId: prediction.place_id,
    description: prediction.description,
    mainText: prediction.structured_formatting.main_text,
    secondaryText: prediction.structured_formatting.secondary_text,
  }));
}

export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceDetails | null> {
  if (!env.googleMapsApiKey) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'place_id,name,formatted_address,geometry',
    key: env.googleMapsApiKey,
    language: 'fr',
  });

  const response = await fetch(`${PLACE_DETAILS_URL}?${params.toString()}`);

  if (!response.ok) return null;

  const data: PlaceDetailsApiResponse = await response.json();

  if (data.status !== 'OK' || !data.result) return null;

  const { result } = data;
  return {
    placeId: result.place_id,
    name: result.name,
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  // Try Google Geocoding API first
  if (env.googleMapsApiKey) {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: env.googleMapsApiKey,
      language: 'fr',
      result_type: 'street_address|route|locality',
    });

    try {
      const response = await fetch(`${GEOCODE_URL}?${params.toString()}`);

      if (response.ok) {
        const data: GeocodeApiResponse = await response.json();
        const firstResult = data.results[0];
        if (data.status === 'OK' && firstResult) {
          return firstResult.formatted_address;
        }
      }
    } catch {
      // Fall through to expo-location
    }
  }

  // Fallback: expo-location reverse geocode
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const addr = results[0];
    if (addr) {
      const parts = [addr.street, addr.city, addr.postalCode].filter(Boolean);
      return parts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  } catch {
    // Last resort
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Google API response types

interface AutocompleteApiResponse {
  status: string;
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
}

interface PlaceDetailsApiResponse {
  status: string;
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
    };
  };
}

interface GeocodeApiResponse {
  status: string;
  results: Array<{
    formatted_address: string;
  }>;
}

export type { LatLng, PlaceAutocompleteResult, PlaceDetails };
