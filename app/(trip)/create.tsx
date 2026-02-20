import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { ContactForm } from '@/src/components/contact/ContactForm';
import { TripMap } from '@/src/components/map/TripMap';
import { scaledIcon } from '@/src/utils/scaling';
import { useTrip } from '@/src/hooks/useTrip';
import { useContacts } from '@/src/hooks/useContacts';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
import { searchPlaces, getPlaceDetails } from '@/src/services/placesService';
import { fetchDirections } from '@/src/services/directionsService';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import type { DecodedRoute } from '@/src/services/directionsService';
import {
  DepartureSection,
  DestinationSection,
  DepartureTimeSection,
  TransportSection,
  ContactSection,
  TogglesSection,
  FooterWarning,
} from '@/src/components/trip/CreateTripSections';

type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

const TRANSPORT_MAP: Record<TransportMode, 'driving' | 'walking' | 'bicycling' | 'transit'> = {
  car: 'driving',
  walk: 'walking',
  bike: 'bicycling',
  transit: 'transit',
};

export default function CreateTripScreen() {
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
      .catch(() => {});
  }, [getCurrentLocation]);

  const handleUseCurrentLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setDepartureLoc({ lat: loc.lat, lng: loc.lng });
      setDepartureAddress('Ma position actuelle');
    } catch {
      // Location not available
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
      } catch {
        // Location not available
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
      } catch {
        // Tracking failed, trip still created
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
    } catch {
      // Error handled by useContacts mutation
    }
  }, [createContact]);

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Tu pourras annuler ou prolonger ton trajet en cas de retard ou problemes a tout moment.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={scaledIcon(18)} color={colors.error[400]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Departure */}
          <DepartureSection
            address={departureAddress}
            onChangeAddress={setDepartureAddress}
            onUseCurrentLocation={handleUseCurrentLocation}
          />

          {/* Destination */}
          <DestinationSection
            address={destinationAddress}
            onChangeAddress={handleDestinationSearch}
            isSearching={isSearching}
            searchResults={searchResults}
            onSelectPlace={handleSelectPlace}
          />

          {/* Map preview */}
          {(selectedPlace || departureLoc) && (
            <TripMap
              departure={departureLoc}
              arrival={selectedPlace}
              routeCoordinates={route?.polyline}
              style={styles.mapPreview}
            />
          )}

          {/* Route info + estimated arrival */}
          {route && (
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate-outline" size={scaledIcon(16)} color={colors.primary[400]} />
                <Text style={styles.routeInfoText}>{route.distance.text}</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time-outline" size={scaledIcon(16)} color={colors.primary[400]} />
                <Text style={styles.routeInfoText}>{route.duration.text}</Text>
              </View>
            </View>
          )}

          {estimatedArrivalTime && (
            <View style={styles.arrivalTimeContainer}>
              <Ionicons name="flag-outline" size={scaledIcon(16)} color={colors.primary[300]} />
              <Text style={styles.arrivalTimeLabel}>Heure d'arrivee estimee</Text>
              <Text style={styles.arrivalTimeValue}>
                {estimatedArrivalTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}

          {/* Transport mode */}
          <TransportSection
            selected={transportMode}
            onSelect={(mode) => {
              setTransportMode(mode);
              if (departureLoc && selectedPlace) {
                fetchRoute(departureLoc, selectedPlace, mode);
              }
            }}
          />

          {/* Departure time */}
          <DepartureTimeSection
            departureTime={departureTime}
            onSetNow={() => setDepartureTime(new Date())}
          />

          {/* Contacts */}
          <ContactSection
            contacts={contacts}
            contactsLoading={contactsLoading}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => setSelectedContactId(selectedContactId === id ? null : id)}
            onShowAddContact={() => setShowAddContact(true)}
          />

          {/* Toggles */}
          <TogglesSection
            shareLocation={shareLocation}
            onToggleShareLocation={setShareLocation}
            silentNotifications={silentNotifications}
            onToggleSilentNotifications={setSilentNotifications}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Lancer le trajet"
              variant="secondary"
              onPress={handleCreateTrip}
              loading={isCreating}
              fullWidth
              size="lg"
              icon={<Ionicons name="navigate" size={scaledIcon(20)} color={colors.white} />}
            />
            <Button
              title="Annuler"
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
            />
          </View>

          <FooterWarning />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Ajouter un contact"
        snapPoints={[0.7]}
      >
        <ContactForm
          onSubmit={handleAddContact}
          onCancel={() => setShowAddContact(false)}
          loading={isCreatingContact}
          submitLabel="Ajouter"
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[6],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(202, 31, 31, 0.15)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[400],
    flex: 1,
  },
  mapPreview: {
    marginBottom: spacing[4],
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[6],
    marginBottom: spacing[4],
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  routeInfoText: {
    ...typography.body,
    color: colors.gray[300],
    fontWeight: '600',
  },
  arrivalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[900],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
  },
  arrivalTimeLabel: {
    ...typography.bodySmall,
    color: colors.gray[300],
    flex: 1,
  },
  arrivalTimeValue: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
