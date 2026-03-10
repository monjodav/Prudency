import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ListItem } from '@/src/components/ui/ListItem';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { TripMap } from '@/src/components/map/TripMap';
import { Loader } from '@/src/components/ui/Loader';
import { mvs, scaledIcon } from '@/src/utils/scaling';
import { searchPlaces, getPlaceDetails } from '@/src/services/placesService';
import { fetchDirections } from '@/src/services/directionsService';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import type { DecodedRoute } from '@/src/services/directionsService';
import type { TripRow } from '@/src/types/trip';

interface EditTripSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updates: {
    arrivalAddress?: string;
    arrivalLat?: number;
    arrivalLng?: number;
    estimatedArrivalAt?: string;
    estimatedDurationMinutes?: number;
  }) => void;
  isSaving: boolean;
  trip: TripRow | null;
}

export function EditTripSheet({
  visible,
  onClose,
  onSave,
  isSaving,
  trip,
}: EditTripSheetProps) {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<DecodedRoute | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const departureLoc = trip?.departure_lat != null && trip?.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const handleReset = useCallback(() => {
    setDestinationAddress('');
    setSearchResults([]);
    setSelectedPlace(null);
    setRoute(null);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleDestinationSearch = useCallback((text: string) => {
    setDestinationAddress(text);
    setSelectedPlace(null);
    setRoute(null);

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
    setSearchResults([]);
    setDestinationAddress(result.description);
    setIsSearching(false);

    const details = await getPlaceDetails(result.placeId);
    if (!details) return;

    const arrival = { lat: details.lat, lng: details.lng };
    setSelectedPlace(arrival);

    if (departureLoc) {
      const directions = await fetchDirections(departureLoc, arrival);
      setRoute(directions);
    }
  }, [departureLoc]);

  const handleSave = useCallback(() => {
    if (!selectedPlace) return;

    const durationMinutes = route
      ? Math.ceil(route.duration.value / 60)
      : null;

    const now = Date.now();
    const estimatedArrivalAt = durationMinutes
      ? new Date(now + durationMinutes * 60_000).toISOString()
      : undefined;

    onSave({
      arrivalAddress: destinationAddress || undefined,
      arrivalLat: selectedPlace.lat,
      arrivalLng: selectedPlace.lng,
      estimatedArrivalAt,
      estimatedDurationMinutes: durationMinutes ?? undefined,
    });

    handleReset();
  }, [selectedPlace, route, destinationAddress, onSave, handleReset]);

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      snapPoints={[0.75]}
      dark
      overlayOpacity={0.2}
      title="Modifier le trajet"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>
          Change ta destination et l'heure d'arrivee sera recalculee.
        </Text>

        <View style={styles.currentDestination}>
          <Ionicons name="flag" size={scaledIcon(16)} color={colors.gray[400]} />
          <Text style={styles.currentLabel}>Destination actuelle :</Text>
          <Text style={styles.currentValue} numberOfLines={1}>
            {trip?.arrival_address ?? 'Non definie'}
          </Text>
        </View>

        <Input
          label="Nouvelle destination"
          placeholder="Ou vas-tu ?"
          value={destinationAddress}
          onChangeText={handleDestinationSearch}
          variant="dark"
        />

        {isSearching && (
          <Loader size="sm" style={styles.spinner} />
        )}

        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            {searchResults.map((result, i) => (
              <View key={result.placeId}>
                <ListItem
                  text={result.mainText}
                  secondaryText={result.secondaryText}
                  iconLeft={
                    <Ionicons name="location-outline" size={scaledIcon(20)} color={colors.primary[300]} />
                  }
                  onPress={() => handleSelectPlace(result)}
                />
                {i < searchResults.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        )}

        {selectedPlace && departureLoc && (
          <TripMap
            departure={departureLoc}
            arrival={selectedPlace}
            routeCoordinates={route?.polyline}
            style={styles.mapPreview}
          />
        )}

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

        {route && (
          <View style={styles.arrivalTimeContainer}>
            <Ionicons name="flag-outline" size={scaledIcon(16)} color={colors.primary[300]} />
            <Text style={styles.arrivalTimeLabel}>Nouvelle heure d'arrivee estimee</Text>
            <Text style={styles.arrivalTimeValue}>
              {new Date(Date.now() + route.duration.value * 1000).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Enregistrer"
            variant="secondary"
            onPress={handleSave}
            loading={isSaving}
            disabled={!selectedPlace}
            fullWidth
            size="lg"
            icon={<Ionicons name="checkmark" size={scaledIcon(20)} color={colors.white} />}
          />
          <Button
            title="Annuler"
            variant="outline"
            onPress={handleClose}
            fullWidth
            size="md"
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: mvs(100, 0.5),
  },
  hint: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  currentDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  currentLabel: {
    ...typography.caption,
    color: colors.gray[400],
  },
  currentValue: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  spinner: {
    marginVertical: spacing[2],
  },
  resultsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: spacing[4],
  },
  mapPreview: {
    height: mvs(200, 0.5),
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
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
  },
});
