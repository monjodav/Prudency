import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTrip } from '@/src/hooks/useTrip';
import { useContacts } from '@/src/hooks/useContacts';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { searchPlaces, getPlaceDetails } from '@/src/services/placesService';
import { fetchDirections } from '@/src/services/directionsService';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import type { DecodedRoute } from '@/src/services/directionsService';

export type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

const TRANSPORT_MAP: Record<TransportMode, 'driving' | 'walking' | 'bicycling' | 'transit'> = {
  car: 'driving',
  walk: 'walking',
  bike: 'bicycling',
  transit: 'transit',
};

export function useTripCreation() {
  const router = useRouter();
  const { createTrip, isCreating } = useTrip();
  const { contacts, isLoading: contactsLoading, createContact, isCreating: isCreatingContact } = useContacts();
  const { getCurrentLocation, startTracking } = useLocation();
  const { setActiveTrip, setTripDetails } = useTripStore();

  const [destinationAddress, setDestinationAddress] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('walk');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [silentNotifications, setSilentNotifications] = useState(false);
  const [departureTime, setDepartureTime] = useState<Date>(new Date());

  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [departureLoc, setDepartureLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<DecodedRoute | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then((loc) => setDepartureLoc({ lat: loc.lat, lng: loc.lng }))
      .catch((err) => {
        if (__DEV__) console.warn('Get initial location failed:', err);
      });
  }, [getCurrentLocation]);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setDepartureLoc({ lat: loc.lat, lng: loc.lng });
      setDepartureAddress('Ma position actuelle');
    } catch (err) {
      if (__DEV__) console.warn('Use current location failed:', err);
    }
  }, [getCurrentLocation]);

  const handleDestinationSearch = useCallback((text: string) => {
    setDestinationAddress(text);
    setSelectedPlace(null);
    setRoute(null);
    setDuration(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (text.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(text, departureLoc ?? undefined);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  }, [departureLoc]);

  const fetchRoute = useCallback(async (
    departure: { lat: number; lng: number },
    arrival: { lat: number; lng: number },
    mode: TransportMode,
  ) => {
    const directions = await fetchDirections(departure, arrival, TRANSPORT_MAP[mode]);
    setRoute(directions);
    if (directions) {
      setDuration(Math.ceil(directions.duration.value / 60));
    }
  }, []);

  const handleSelectPlace = useCallback(async (result: PlaceAutocompleteResult) => {
    setSearchResults([]);
    setDestinationAddress(result.description);
    setIsSearching(false);

    const details = await getPlaceDetails(result.placeId);
    if (!details) return;

    const arrival = { lat: details.lat, lng: details.lng };
    setSelectedPlace(arrival);

    if (departureLoc) {
      await fetchRoute(departureLoc, arrival, transportMode);
    }
  }, [departureLoc, transportMode, fetchRoute]);

  const estimatedArrivalTime = duration != null
    ? new Date(departureTime.getTime() + duration * 60_000)
    : null;

  const handleCreateTrip = useCallback(async () => {
    setError(null);
    try {
      let departureLat: number | undefined;
      let departureLng: number | undefined;

      try {
        const location = await getCurrentLocation();
        departureLat = location.lat;
        departureLng = location.lng;
      } catch (err) {
        if (__DEV__) console.warn('Get current location failed:', err);
      }

      const trip = await createTrip({
        estimatedDurationMinutes: duration ?? 30,
        arrivalAddress: destinationAddress || undefined,
        arrivalLat: selectedPlace?.lat,
        arrivalLng: selectedPlace?.lng,
        departureLat,
        departureLng,
      });

      setActiveTrip(trip.id);
      setTripDetails({
        arrivalAddress: destinationAddress || undefined,
        estimatedDurationMinutes: duration ?? undefined,
      });

      try {
        await startTracking();
      } catch (err) {
        if (__DEV__) console.warn('Start tracking failed:', err);
      }

      router.replace('/(trip)/active');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la creation du trajet';
      setError(message);
    }
  }, [duration, destinationAddress, selectedPlace, createTrip, getCurrentLocation, startTracking, setActiveTrip, setTripDetails, router]);

  const handleAddContact = useCallback(async (formData: {
    name: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    notifyBySms: boolean;
    notifyByPush: boolean;
  }) => {
    try {
      const newContact = await createContact({
        name: formData.name,
        phone: formData.phone,
        isPrimary: formData.isPrimary,
      });
      setSelectedContactId(newContact.id);
      setShowAddContact(false);
    } catch (err) {
      if (__DEV__) console.warn('Contact creation failed:', err);
    }
  }, [createContact]);

  return {
    // State
    destinationAddress,
    departureAddress,
    setDepartureAddress,
    transportMode,
    setTransportMode,
    selectedContactId,
    setSelectedContactId,
    error,
    showAddContact,
    setShowAddContact,
    shareLocation,
    setShareLocation,
    silentNotifications,
    setSilentNotifications,
    departureTime,
    setDepartureTime,
    searchResults,
    isSearching,
    selectedPlace,
    departureLoc,
    route,
    duration,
    estimatedArrivalTime,

    // Data from hooks
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,

    // Handlers
    handleUseCurrentLocation,
    handleDestinationSearch,
    fetchRoute,
    handleSelectPlace,
    handleCreateTrip,
    handleAddContact,
  };
}
