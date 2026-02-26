import { useState, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { searchPlaces, getPlaceDetails } from '@/src/services/placesService';
import { usePlaces } from '@/src/hooks/usePlaces';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import type { SavedPlace } from '@/src/types/database';

const DEBOUNCE_MS = 400;

interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
}

export function useAddPlace() {
  const { addPlace, isAddingPlace, updatePlace, isUpdatingPlace } = usePlaces();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [name, setName] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setSelectedPlace(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(text);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleSelectResult = useCallback(async (result: PlaceAutocompleteResult) => {
    Keyboard.dismiss();
    setSearchQuery(result.description);
    setSearchResults([]);
    setIsSearching(true);

    try {
      const details = await getPlaceDetails(result.placeId);
      if (details) {
        setSelectedPlace({
          address: details.address,
          lat: details.lat,
          lng: details.lng,
        });
        setSearchQuery(details.address);
      }
    } catch {
      // Keep the description as fallback
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectRecentPlace = useCallback((place: SavedPlace) => {
    setSearchQuery(place.address);
    setName(place.name);
    setSelectedPlace({
      address: place.address,
      lat: place.latitude,
      lng: place.longitude,
    });
    setSearchResults([]);
    Keyboard.dismiss();
  }, []);

  const prefill = useCallback((place: SavedPlace) => {
    setEditingId(place.id);
    setSearchQuery(place.address);
    setName(place.name);
    setSelectedPlace({
      address: place.address,
      lat: place.latitude,
      lng: place.longitude,
    });
    setSearchResults([]);
  }, []);

  const handleSave = useCallback(async (): Promise<SavedPlace | null> => {
    if (!selectedPlace || !name.trim()) return null;

    try {
      if (editingId) {
        const updated = await updatePlace(editingId, {
          name: name.trim(),
          address: selectedPlace.address,
          latitude: selectedPlace.lat,
          longitude: selectedPlace.lng,
        });
        return updated;
      }
      const saved = await addPlace({
        name: name.trim(),
        address: selectedPlace.address,
        latitude: selectedPlace.lat,
        longitude: selectedPlace.lng,
        place_type: 'favorite',
      });
      return saved;
    } catch {
      throw new Error('Impossible de sauvegarder le lieu');
    }
  }, [selectedPlace, name, addPlace, editingId, updatePlace]);

  const reset = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setName('');
    setSelectedPlace(null);
    setEditingId(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const isFormValid = name.trim() !== '' && selectedPlace !== null;

  return {
    searchQuery,
    searchResults,
    isSearching,
    name,
    setName,
    selectedPlace,
    editingId,
    isFormValid,
    isSaving: isAddingPlace || isUpdatingPlace,
    handleSearch,
    handleSelectResult,
    handleSelectRecentPlace,
    prefill,
    handleSave,
    reset,
  };
}
