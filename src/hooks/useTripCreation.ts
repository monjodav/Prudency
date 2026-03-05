import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Accuracy } from 'expo-location';
import { useTrip } from '@/src/hooks/useTrip';
import { useContacts } from '@/src/hooks/useContacts';
import { useLocation } from '@/src/hooks/useLocation';
import { usePastTrips } from '@/src/hooks/useHistory';
import { usePlaces } from '@/src/hooks/usePlaces';
import { useTripStore } from '@/src/stores/tripStore';
import { searchPlaces, getPlaceDetails, reverseGeocode } from '@/src/services/placesService';
import { fetchDirectionsMultiple, buildRouteSegments } from '@/src/services/directionsService';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import type { DecodedRoute, RouteSegment } from '@/src/services/directionsService';

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
  const { trips: pastTrips } = usePastTrips();
  const { places: savedPlacesData } = usePlaces();
  const { setActiveTrip, setTripDetails } = useTripStore();

  const [destinationAddress, setDestinationAddress] = useState('');
  const [departureAddress, setDepartureAddress] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('walk');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareLocation, setShareLocation] = useState(true);
  const [silentNotifications, setSilentNotifications] = useState(false);
  const [departureTime, setDepartureTime] = useState<Date>(new Date());

  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [departureSearchResults, setDepartureSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isDepartureSearching, setIsDepartureSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [departureLoc, setDepartureLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<DecodedRoute | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [routes, setRoutes] = useState<DecodedRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const departureSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvingLockRef = useRef(false);

  useEffect(() => {
    getCurrentLocation(Accuracy.Balanced)
      .then((loc) => setDepartureLoc({ lat: loc.lat, lng: loc.lng }))
      .catch((err) => {
        if (__DEV__) console.warn('Get initial location failed:', err);
      });
  }, [getCurrentLocation]);

  const [isGeocodingDeparture, setIsGeocodingDeparture] = useState(false);
  const [isResolvingDeparture, setIsResolvingDeparture] = useState(false);

  const handleUseCurrentLocation = useCallback(async () => {
    if (resolvingLockRef.current) return;
    resolvingLockRef.current = true;
    setIsGeocodingDeparture(true);

    try {
      const loc = await getCurrentLocation(Accuracy.Balanced);
      setDepartureLoc({ lat: loc.lat, lng: loc.lng });
      setDepartureAddress('Ma position actuelle');

      try {
        const address = await reverseGeocode(loc.lat, loc.lng);
        setDepartureAddress(address);
      } catch {
        // keep "Ma position actuelle" as fallback
      }
    } catch (err) {
      if (__DEV__) console.warn('Use current location failed:', err);
    } finally {
      setIsGeocodingDeparture(false);
      resolvingLockRef.current = false;
    }
  }, [getCurrentLocation]);

  const handleDepartureSearch = useCallback((text: string) => {
    setDepartureAddress(text);

    if (departureSearchTimeoutRef.current) clearTimeout(departureSearchTimeoutRef.current);
    if (text.trim().length < 3) {
      setDepartureSearchResults([]);
      return;
    }

    departureSearchTimeoutRef.current = setTimeout(async () => {
      setIsDepartureSearching(true);
      const results = await searchPlaces(text, departureLoc ?? undefined);
      setDepartureSearchResults(results);
      setIsDepartureSearching(false);
    }, 400);
  }, [departureLoc]);

  const fetchRoute = useCallback(async (
    departure: { lat: number; lng: number },
    arrival: { lat: number; lng: number },
    mode: TransportMode,
  ) => {
    setIsLoadingRoutes(true);
    try {
      const allRoutes = await fetchDirectionsMultiple(departure, arrival, TRANSPORT_MAP[mode]);
      setRoutes(allRoutes);
      setSelectedRouteIndex(0);
      const first = allRoutes[0] ?? null;
      setRoute(first);
      setDuration(first ? Math.ceil(first.duration.value / 60) : null);
      setRouteSegments(first ? buildRouteSegments(first) : []);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, []);

  const handleSelectDeparturePlace = useCallback(async (result: PlaceAutocompleteResult) => {
    if (resolvingLockRef.current) return;
    resolvingLockRef.current = true;

    Keyboard.dismiss();
    setDepartureSearchResults([]);
    setDepartureAddress(result.description);
    setIsDepartureSearching(false);
    setIsResolvingDeparture(true);

    try {
      const details = await getPlaceDetails(result.placeId);
      if (!details) return;

      const departure = { lat: details.lat, lng: details.lng };
      setDepartureLoc(departure);

      if (selectedPlace) {
        await fetchRoute(departure, selectedPlace, transportMode);
      }
    } finally {
      setIsResolvingDeparture(false);
      resolvingLockRef.current = false;
    }
  }, [selectedPlace, transportMode, fetchRoute]);

  const selectRoute = useCallback((index: number) => {
    const selected = routes[index];
    if (!selected) return;
    setSelectedRouteIndex(index);
    setRoute(selected);
    setDuration(Math.ceil(selected.duration.value / 60));
    setRouteSegments(buildRouteSegments(selected));
  }, [routes]);

  const handleDestinationSearch = useCallback((text: string) => {
    setDestinationAddress(text);
    setSelectedPlace(null);
    setRoute(null);
    setDuration(null);
    setRoutes([]);
    setSelectedRouteIndex(0);
    setRouteSegments([]);

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

  const handleSelectPlace = useCallback(async (result: PlaceAutocompleteResult) => {
    if (resolvingLockRef.current) return;
    resolvingLockRef.current = true;

    Keyboard.dismiss();
    setSearchResults([]);
    setDestinationAddress(result.description);
    setIsSearching(false);

    try {
      const details = await getPlaceDetails(result.placeId);
      if (!details) return;

      const arrival = { lat: details.lat, lng: details.lng };
      setSelectedPlace(arrival);

      if (departureLoc) {
        await fetchRoute(departureLoc, arrival, transportMode);
      }
    } finally {
      resolvingLockRef.current = false;
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
        departureAddress: departureAddress || undefined,
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
  }, [duration, destinationAddress, departureAddress, selectedPlace, createTrip, getCurrentLocation, startTracking, setActiveTrip, setTripDetails, router]);

  const swapAddresses = useCallback(async () => {
    const prevDeparture = departureAddress;
    const prevDepartureLoc = departureLoc;
    const prevDestination = destinationAddress;
    const prevDestinationLoc = selectedPlace;

    setDepartureAddress(prevDestination);
    setDepartureLoc(prevDestinationLoc);
    setDestinationAddress(prevDeparture);
    setSelectedPlace(prevDepartureLoc);
    setSearchResults([]);
    setDepartureSearchResults([]);

    if (prevDestinationLoc && prevDepartureLoc) {
      await fetchRoute(prevDestinationLoc, prevDepartureLoc, transportMode);
    } else {
      setRoute(null);
      setDuration(null);
      setRoutes([]);
      setSelectedRouteIndex(0);
      setRouteSegments([]);
    }
  }, [departureAddress, departureLoc, destinationAddress, selectedPlace, transportMode, fetchRoute]);

  const clearDeparture = useCallback(() => {
    setDepartureAddress('');
    setDepartureLoc(null);
    setDepartureSearchResults([]);
    setRoute(null);
    setDuration(null);
    setRoutes([]);
    setSelectedRouteIndex(0);
    setRouteSegments([]);
  }, []);

  const clearDestination = useCallback(() => {
    setDestinationAddress('');
    setSelectedPlace(null);
    setSearchResults([]);
    setRoute(null);
    setDuration(null);
    setRoutes([]);
    setSelectedRouteIndex(0);
    setRouteSegments([]);
  }, []);

  const savedPlaces = useMemo(() => {
    return savedPlacesData.map((p) => ({
      name: p.name,
      lat: p.latitude,
      lng: p.longitude,
    }));
  }, [savedPlacesData]);

  const recentPlaces = useMemo(() => {
    const seen = new Set<string>();
    return pastTrips
      .filter((t) => t.arrival_address && t.arrival_lat != null && t.arrival_lng != null)
      .filter((t) => {
        const key = `${t.arrival_lat},${t.arrival_lng}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5)
      .map((t) => ({
        name: t.arrival_address!,
        address: t.departure_address ?? '',
        lat: t.arrival_lat!,
        lng: t.arrival_lng!,
      }));
  }, [pastTrips]);

  const handleSelectRecentPlace = useCallback(async (place: { name: string; lat: number; lng: number }) => {
    setDestinationAddress(place.name);
    setSearchResults([]);

    const arrival = { lat: place.lat, lng: place.lng };
    setSelectedPlace(arrival);

    if (departureLoc) {
      await fetchRoute(departureLoc, arrival, transportMode);
    }
  }, [departureLoc, transportMode, fetchRoute]);

  const handleAddContact = useCallback(async (formData: {
    name: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    notifyBySms: boolean;
    notifyByPush: boolean;
  }) => {
    const existing = contacts.find((c) => c.phone === formData.phone);
    if (existing && existing.validation_status === 'pending') {
      throw new Error('Une demande est déjà en attente pour ce contact.');
    }
    try {
      const newContact = await createContact({
        name: formData.name,
        phone: formData.phone,
        isPrimary: formData.isPrimary,
      });
      setSelectedContactId(newContact.id);
    } catch (err) {
      if (__DEV__) console.warn('Contact creation failed:', err);
      throw err;
    }
  }, [createContact, contacts]);

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
    shareLocation,
    setShareLocation,
    silentNotifications,
    setSilentNotifications,
    departureTime,
    setDepartureTime,
    searchResults,
    isSearching,
    departureSearchResults,
    isDepartureSearching,
    selectedPlace,
    departureLoc,
    route,
    duration,
    routes,
    selectedRouteIndex,
    isLoadingRoutes,
    estimatedArrivalTime,
    isGeocodingDeparture,
    isResolvingDeparture,
    routeSegments,

    // Data from hooks
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,

    // Handlers
    handleUseCurrentLocation,
    handleDepartureSearch,
    handleSelectDeparturePlace,
    dismissDepartureResults: useCallback(() => {
      setDepartureSearchResults([]);
      Keyboard.dismiss();
    }, []),
    handleDestinationSearch,
    fetchRoute,
    handleSelectPlace,
    dismissDestinationResults: useCallback(() => {
      setSearchResults([]);
      Keyboard.dismiss();
    }, []),
    handleCreateTrip,
    handleAddContact,
    swapAddresses,
    selectRoute,
    clearDeparture,
    clearDestination,
    savedPlaces,
    recentPlaces,
    handleSelectRecentPlace,
  };
}
