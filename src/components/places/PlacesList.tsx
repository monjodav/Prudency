import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledFontSize } from '@/src/utils/scaling';
import type { SavedPlace } from '@/src/types/database';

const PLACE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  work: 'briefcase',
  favorite: 'star',
  other: 'location',
};

function getPlaceIcon(place: SavedPlace): keyof typeof Ionicons.glyphMap {
  return PLACE_TYPE_ICONS[place.place_type ?? 'other'] ?? 'location';
}

interface PlacesListProps {
  places: SavedPlace[];
  onPlacePress: (place: SavedPlace) => void;
}

export function PlacesList({ places, onPlacePress }: PlacesListProps) {
  const savedPlaces = places.filter(
    (p) => p.place_type === 'home' || p.place_type === 'work' || p.place_type === 'favorite',
  );
  const recentPlaces = places.filter(
    (p) => p.place_type === 'other' || p.place_type == null,
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {savedPlaces.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Lieux enregistres</Text>
          {savedPlaces.map((place) => (
            <PlaceRow key={place.id} place={place} onPress={onPlacePress} />
          ))}
        </>
      )}

      {recentPlaces.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              savedPlaces.length > 0 && { marginTop: spacing[5] },
            ]}
          >
            Lieux recents
          </Text>
          {recentPlaces.map((place) => (
            <PlaceRow key={place.id} place={place} onPress={onPlacePress} />
          ))}
        </>
      )}

      {places.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="location-outline"
            size={scaledIcon(32)}
            color={colors.gray[400]}
          />
          <Text style={styles.emptyText}>Aucun lieu enregistre</Text>
        </View>
      )}
    </ScrollView>
  );
}

function PlaceRow({
  place,
  onPress,
}: {
  place: SavedPlace;
  onPress: (place: SavedPlace) => void;
}) {
  return (
    <Pressable style={styles.placeRow} onPress={() => onPress(place)}>
      <View style={styles.placeIcon}>
        <Ionicons
          name={getPlaceIcon(place)}
          size={scaledIcon(18)}
          color={colors.primary[500]}
        />
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {place.address}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={scaledIcon(16)}
        color={colors.gray[400]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.buttonSmall,
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: scaledFontSize(1),
    marginBottom: spacing[3],
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  placeIcon: {
    width: ms(36, 0.4),
    height: ms(36, 0.4),
    borderRadius: ms(18, 0.4),
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  placeInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  placeName: {
    ...typography.bodySmall,
    color: colors.gray[900],
    fontWeight: '600',
  },
  placeAddress: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[500],
  },
});
