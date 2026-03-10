import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { ListItem } from '@/src/components/ui/ListItem';
import { MetroIcon } from '@/src/components/transit/MetroIcon';
import { BusIcon } from '@/src/components/transit/BusIcon';
import { TramIcon } from '@/src/components/transit/TramIcon';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';

const RESULT_ITEM_HEIGHT = ms(52, 0.4);
const MAX_VISIBLE_RESULTS = 5;

type TransitIconType = 'metro' | 'tram' | 'bus' | 'rer' | 'train' | 'airport';

function detectTransitModes(types: string[], text: string): TransitIconType[] {
  const modes: TransitIconType[] = [];
  const lower = text.toLowerCase();

  const hasType = (t: string) => types.includes(t);
  const hasText = (keyword: string) => lower.includes(keyword);

  if (hasType('subway_station') || hasText('métro') || hasText('metro')) modes.push('metro');
  if (hasType('light_rail_station') || hasText('tramway') || hasText('tram')) modes.push('tram');
  if (hasType('bus_station') || hasText('bus')) modes.push('bus');
  if (hasText('rer')) modes.push('rer');
  if (hasType('train_station') || hasText('gare')) modes.push('train');
  if (hasType('airport') || hasText('aéroport') || hasText('airport')) modes.push('airport');

  return modes;
}

export function PlaceIcons({ types, secondaryText, size }: { types: string[]; secondaryText: string; size: number }) {
  const modes = detectTransitModes(types, secondaryText);

  if (modes.length === 0) {
    return <Ionicons name="location-outline" size={size} color={colors.primary[300]} />;
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(3, 0.3) }}>
      {modes.map((mode) => {
        switch (mode) {
          case 'metro':
            return <MetroIcon key={mode} size={size} />;
          case 'tram':
            return <TramIcon key={mode} size={size} />;
          case 'bus':
            return <BusIcon key={mode} size={size} />;
          case 'rer':
          case 'train':
            return <Ionicons key={mode} name="train-outline" size={size} color={colors.primary[300]} />;
          case 'airport':
            return <Ionicons key={mode} name="airplane-outline" size={size} color={colors.primary[300]} />;
        }
      })}
    </View>
  );
}

interface SearchResultsProps {
  results: PlaceAutocompleteResult[];
  onSelect: (result: PlaceAutocompleteResult) => void;
  onDismiss: () => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  return (
    <View style={styles.resultsCard}>
      <ScrollView
        style={{ maxHeight: RESULT_ITEM_HEIGHT * MAX_VISIBLE_RESULTS }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={results.length > MAX_VISIBLE_RESULTS}
        nestedScrollEnabled
      >
        {results.map((result, i) => (
          <View key={result.placeId}>
            <ListItem
              text={result.mainText}
              secondaryText={result.secondaryText}
              iconLeft={<PlaceIcons types={result.types} secondaryText={result.secondaryText} size={scaledIcon(20)} />}
              onPress={() => onSelect(result)}
            />
            {i < results.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
