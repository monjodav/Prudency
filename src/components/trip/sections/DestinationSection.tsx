import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon } from '@/src/utils/scaling';
import { Input } from '@/src/components/ui/Input';
import { ListItem } from '@/src/components/ui/ListItem';
import { Loader } from '@/src/components/ui/Loader';
import { SearchResults } from './SearchResults';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';

interface DestinationSectionProps {
  address: string;
  onChangeAddress: (text: string) => void;
  onClear: () => void;
  isSearching: boolean;
  searchResults: PlaceAutocompleteResult[];
  onSelectPlace: (result: PlaceAutocompleteResult) => void;
  onDismissResults: () => void;
  savedPlaces?: { name: string; onPress: () => void }[];
  recentPlaces?: { name: string; address: string; onPress: () => void }[];
  onFocus?: () => void;
}

export function DestinationSection({
  address,
  onChangeAddress,
  onClear,
  isSearching,
  searchResults,
  onSelectPlace,
  onDismissResults,
  savedPlaces,
  recentPlaces,
  onFocus,
}: DestinationSectionProps) {
  return (
    <View>
      <Input
        label="Lieu d'arrivée"
        placeholder="Où vas-tu ?"
        value={address}
        onChangeText={onChangeAddress}
        onFocus={onFocus}
        onBlur={onDismissResults}
        variant="dark"
        iconRight={
          address.length > 0 ? (
            <Pressable onPress={onClear} hitSlop={8}>
              <Ionicons name="close-circle" size={scaledIcon(20)} color={colors.gray[500]} />
            </Pressable>
          ) : undefined
        }
      />
      {isSearching && (
        <Loader size="sm" style={styles.searchSpinner} />
      )}
      {searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onSelect={onSelectPlace}
          onDismiss={onDismissResults}
        />
      )}
      {searchResults.length === 0 && !isSearching && (
        <>
          {savedPlaces && savedPlaces.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Trajets enregistrés</Text>
              <View style={styles.resultsCard}>
                {savedPlaces.map((place, i) => (
                  <View key={place.name + i}>
                    <ListItem
                      text={place.name}
                      iconLeft={
                        <Ionicons name="bookmark" size={scaledIcon(20)} color={colors.primary[300]} />
                      }
                      onPress={place.onPress}
                    />
                    {i < savedPlaces.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}
          {recentPlaces && recentPlaces.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Trajets récents</Text>
              <View style={styles.resultsCard}>
                {recentPlaces.map((place, i) => (
                  <View key={place.name + i}>
                    <ListItem
                      text={place.name}
                      secondaryText={place.address}
                      iconLeft={
                        <Ionicons name="time" size={scaledIcon(20)} color={colors.primary[300]} />
                      }
                      onPress={place.onPress}
                    />
                    {i < recentPlaces.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchSpinner: {
    marginVertical: spacing[2],
  },
  resultsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: spacing[4],
  },
  suggestionsSection: {
    marginBottom: spacing[4],
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[2],
  },
});
