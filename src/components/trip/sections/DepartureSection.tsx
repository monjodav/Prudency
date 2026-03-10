import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledIcon } from '@/src/utils/scaling';
import { Input } from '@/src/components/ui/Input';
import { ListItem } from '@/src/components/ui/ListItem';
import { Loader } from '@/src/components/ui/Loader';
import { SearchResults } from './SearchResults';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';

interface DepartureSectionProps {
  address: string;
  onChangeAddress: (text: string) => void;
  onUseCurrentLocation: () => void;
  onClear: () => void;
  isGeocoding: boolean;
  isResolving: boolean;
  isSearching: boolean;
  searchResults: PlaceAutocompleteResult[];
  onSelectPlace: (result: PlaceAutocompleteResult) => void;
  onDismissResults: () => void;
}

export function DepartureSection({
  address,
  onChangeAddress,
  onUseCurrentLocation,
  onClear,
  isGeocoding,
  isResolving,
  isSearching,
  searchResults,
  onSelectPlace,
  onDismissResults,
}: DepartureSectionProps) {
  const isBusy = isGeocoding || isResolving;
  const showClear = address.length > 0 && !isBusy;

  const inputIconRight = isBusy ? (
    <Loader size="sm" />
  ) : showClear ? (
    <Pressable onPress={onClear} hitSlop={8}>
      <Ionicons name="close-circle" size={scaledIcon(20)} color={colors.gray[500]} />
    </Pressable>
  ) : undefined;

  return (
    <View>
      <Input
        label="Lieu de départ"
        placeholder={isBusy ? 'Localisation en cours...' : "D'où pars-tu ?"}
        value={isBusy ? '' : address}
        onChangeText={onChangeAddress}
        onBlur={onDismissResults}
        variant="dark"
        editable={!isBusy}
        iconRight={inputIconRight}
      />
      {isSearching && !isResolving && (
        <Loader size="sm" style={styles.searchSpinner} />
      )}
      {searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onSelect={onSelectPlace}
          onDismiss={onDismissResults}
        />
      )}
      <View style={styles.currentLocationWrapper}>
        <ListItem
          text="Utiliser ma position actuelle"
          variant="outline"
          iconLeft={
            isGeocoding
              ? <Loader size="sm" color={colors.primary[300]} />
              : <Ionicons name="locate" size={scaledIcon(20)} color={colors.primary[300]} />
          }
          onPress={onUseCurrentLocation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  currentLocationWrapper: {
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },
  searchSpinner: {
    marginVertical: spacing[2],
  },
});
