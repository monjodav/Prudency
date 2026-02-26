import { Button } from '@/src/components/ui/Button';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { useAddPlace } from '@/src/hooks/useAddPlace';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { SavedPlace } from '@/src/types/database';
import { ms, scaledFontSize, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type SheetPage = 'list' | 'addPlace';

interface PlacesBottomSheetProps {
  places: SavedPlace[];
  onPlacePress: (place: SavedPlace) => void;
  onDeletePlace: (place: SavedPlace) => void;
  bottomInset: number;
  onSheetChange?: (index: number) => void;
  onSaveSuccess?: (place: SavedPlace) => void;
  onSaveError?: () => void;
  onPlaceSelected?: (coords: { lat: number; lng: number }) => void;
}

export function PlacesBottomSheet({
  places,
  onPlacePress,
  onDeletePlace,
  bottomInset,
  onSheetChange,
  onSaveSuccess,
  onSaveError,
  onPlaceSelected,
}: PlacesBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState<SheetPage>('list');

  const {
    searchQuery,
    searchResults,
    isSearching,
    name,
    setName,
    selectedPlace,
    editingId,
    isFormValid,
    isSaving,
    handleSearch,
    handleSelectResult,
    handleSelectRecentPlace,
    prefill,
    handleSave,
    reset,
  } = useAddPlace();

  const handleTap = useCallback(() => {
    if (currentIndex === 0) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [currentIndex]);

  const handleChange = useCallback((index: number) => {
    setCurrentIndex(index);
    onSheetChange?.(index);
    if (index === 0 && page === 'addPlace') {
      setPage('list');
      reset();
    }
  }, [onSheetChange, page, reset]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.3}
        pressBehavior="collapse"
      />
    ),
    [],
  );

  const snapPoints = useMemo(
    () => ['4%', '45%'],
    [],
  );

  const savedPlaces = useMemo(
    () =>
      places.filter(
        (p) =>
          p.place_type === 'home' ||
          p.place_type === 'work' ||
          p.place_type === 'favorite',
      ),
    [places],
  );

  const recentPlaces = useMemo(
    () =>
      places.filter(
        (p) => p.place_type === 'other' || p.place_type == null,
      ),
    [places],
  );

  const recentForForm = useMemo(
    () => places.slice(0, 5),
    [places],
  );

  const handleOpenAddPlace = useCallback(() => {
    setPage('addPlace');
  }, []);

  const handleBack = useCallback(() => {
    setPage('list');
    reset();
  }, [reset]);

  const handleSelectAutocomplete = useCallback(
    async (result: PlaceAutocompleteResult) => {
      await handleSelectResult(result);
    },
    [handleSelectResult],
  );

  const handleSelectRecent = useCallback(
    (place: SavedPlace) => {
      handleSelectRecentPlace(place);
      onPlaceSelected?.({ lat: place.latitude, lng: place.longitude });
    },
    [handleSelectRecentPlace, onPlaceSelected],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const saved = await handleSave();
      if (saved) {
        onSaveSuccess?.(saved);
        setPage('list');
        reset();
        bottomSheetRef.current?.snapToIndex(1);
      }
    } catch {
      onSaveError?.();
    }
  }, [handleSave, onSaveSuccess, onSaveError, reset]);

  const getMenuItems = useCallback((place: SavedPlace) => {
    return [
      {
        label: 'Modifier',
        icon: 'pencil' as keyof typeof Ionicons.glyphMap,
        onPress: () => {
          prefill(place);
          setPage('addPlace');
        },
      },
      {
        label: 'Supprimer',
        icon: 'trash' as keyof typeof Ionicons.glyphMap,
        onPress: () => onDeletePlace(place),
        destructive: true,
      },
    ];
  }, [onDeletePlace, prefill]);

  const showAutocomplete = searchResults.length > 0 && !selectedPlace;

  // --- Render: saved place row (bookmark icon + name + context menu) ---
  const renderSavedPlace = useCallback(
    (place: SavedPlace, isLast: boolean) => (
      <Pressable
        key={place.id}
        style={({ pressed }) => [
          styles.listItemRow,
          !isLast && styles.listItemDivider,
          pressed && styles.listItemPressed,
        ]}
        onPress={() => onPlacePress(place)}
      >
        <View style={styles.listItemContent}>
          <Ionicons
            name="bookmark"
            size={scaledIcon(24)}
            color={colors.primary[300]}
          />
          <View style={styles.listItemTextContainer}>
            <Text style={styles.listItemLabel} numberOfLines={1}>
              {place.name}
            </Text>
          </View>
        </View>
        <ContextMenu items={getMenuItems(place)}>
          <Ionicons
            name="ellipsis-vertical"
            size={scaledIcon(24)}
            color={colors.gray[50]}
          />
        </ContextMenu>
      </Pressable>
    ),
    [onPlacePress, getMenuItems],
  );

  // --- Render: recent place row (clock icon + name + address + context menu) ---
  const renderRecentPlace = useCallback(
    (place: SavedPlace, isLast: boolean) => (
      <Pressable
        key={place.id}
        style={({ pressed }) => [
          styles.listItemRow,
          !isLast && styles.listItemDivider,
          pressed && styles.listItemPressed,
        ]}
        onPress={() => onPlacePress(place)}
      >
        <View style={styles.listItemContent}>
          <Ionicons
            name="time"
            size={scaledIcon(24)}
            color={colors.primary[300]}
          />
          <View style={styles.listItemTextContainer}>
            <Text style={styles.recentPlaceName} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.recentPlaceAddress} numberOfLines={1}>
              {place.address}
            </Text>
          </View>
        </View>
        <ContextMenu items={getMenuItems(place)}>
          <Ionicons
            name="ellipsis-vertical"
            size={scaledIcon(24)}
            color={colors.gray[50]}
          />
        </ContextMenu>
      </Pressable>
    ),
    [onPlacePress, getMenuItems],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundComponent={({ style }) => (
        <View style={[style, styles.background]}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handleArea}
      handleComponent={() => (
        <Pressable onPress={handleTap} style={styles.handleTap}>
          <View style={styles.handleIndicator} />
        </Pressable>
      )}
      bottomInset={bottomInset}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      overDragResistanceFactor={10}
      onChange={handleChange}
      onAnimate={(_from: number, to: number) => onSheetChange?.(to)}
      style={styles.sheet}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      {page === 'list' ? (
        <BottomSheetView style={styles.scrollContent}>
          {/* Section: Lieux enregistrés */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lieux enregistrés</Text>
            </View>

            {savedPlaces.length > 0 && (
              <View style={styles.card}>
                {savedPlaces.map((place, i) =>
                  renderSavedPlace(place, i === savedPlaces.length - 1),
                )}
              </View>
            )}

            {/* "Enregistrer un lieu" — List Item with outline */}
            <Pressable
              style={({ pressed }) => [
                styles.addPlaceRow,
                pressed && styles.addPlaceRowPressed,
              ]}
              onPress={handleOpenAddPlace}
            >
              <View style={styles.listItemContent}>
                <Ionicons
                  name="add"
                  size={scaledIcon(24)}
                  color={colors.primary[300]}
                />
                <View style={styles.listItemTextContainer}>
                  <Text style={styles.listItemLabel}>Enregistrer un lieu</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Section: Lieux récents */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lieux récents</Text>
            </View>

            {recentPlaces.length > 0 ? (
              <View style={styles.card}>
                {recentPlaces.map((place, i) =>
                  renderRecentPlace(place, i === recentPlaces.length - 1),
                )}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Aucun trajet récent pour le moment.{'\n'}
                Tu pourras retrouver tes trajets récents et enregistrés ici !
              </Text>
            )}
          </View>
        </BottomSheetView>
      ) : (
        <BottomSheetView
          style={styles.scrollContent}
        >
          {/* Header with back button */}
          <View style={styles.formHeader}>
            <Pressable onPress={handleBack} hitSlop={12}>
              <Ionicons name="arrow-back" size={scaledIcon(24)} color={colors.white} />
            </Pressable>
            <Text style={styles.formHeaderTitle}>{editingId ? 'Modifier le lieu' : 'Enregistrer un lieu'}</Text>
            <View style={{ width: scaledIcon(24) }} />
          </View>

          {/* Address field — DS Input component */}
          <Text style={styles.inputLabel}>Adresse</Text>
          <View style={styles.inputContainer}>
            <BottomSheetTextInput
              style={styles.textInput}
              placeholder="Rechercher une adresse"
              placeholderTextColor="rgba(136, 136, 136, 0.5)"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary[300]} style={styles.inputIcon} />
            ) : selectedPlace ? (
              <Pressable onPress={() => handleSearch('')} style={styles.inputIcon} hitSlop={8}>
                <Ionicons name="close-circle" size={scaledIcon(24)} color={colors.gray[50]} />
              </Pressable>
            ) : (
              <Ionicons name="search" size={scaledIcon(24)} color={colors.gray[50]} style={styles.inputIcon} />
            )}
          </View>

          {/* Autocomplete results — scrollable list */}
          {showAutocomplete && (
            <ScrollView
              nestedScrollEnabled
              style={styles.autocompleteList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.card}>
                {searchResults.map((result, i) => (
                  <Pressable
                    key={result.placeId}
                    style={({ pressed }) => [
                      styles.listItemRow,
                      i < searchResults.length - 1 && styles.listItemDivider,
                      pressed && styles.listItemPressed,
                    ]}
                    onPress={() => handleSelectAutocomplete(result)}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="location-outline" size={scaledIcon(24)} color={colors.primary[300]} />
                      <View style={styles.listItemTextContainer}>
                        <Text style={styles.recentPlaceName} numberOfLines={1}>{result.mainText}</Text>
                        <Text style={styles.recentPlaceAddress} numberOfLines={1}>{result.secondaryText}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Name field — DS Input component */}
          <Text style={styles.inputLabel}>Nomme le lieu</Text>
          <View style={styles.inputContainer}>
            <BottomSheetTextInput
              style={styles.textInput}
              placeholder="Maison"
              placeholderTextColor="rgba(136, 136, 136, 0.5)"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Recent places for form — DS List Items in card */}
          {recentForForm.length > 0 && !showAutocomplete && (
            <View style={styles.sectionGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trajets récents</Text>
              </View>
              <View style={styles.card}>
                {recentForForm.map((place, i) => (
                  <Pressable
                    key={place.id}
                    style={({ pressed }) => [
                      styles.listItemRow,
                      i < recentForForm.length - 1 && styles.listItemDivider,
                      pressed && styles.listItemPressed,
                    ]}
                    onPress={() => handleSelectRecent(place)}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="time" size={scaledIcon(24)} color={colors.primary[300]} />
                      <View style={styles.listItemTextContainer}>
                        <Text style={styles.recentPlaceName} numberOfLines={1}>{place.name}</Text>
                        <Text style={styles.recentPlaceAddress} numberOfLines={1}>{place.address}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Save button — DS Button primary */}
          <View style={styles.buttonContainer}>
            <Button
              title={editingId ? 'Modifier le lieu' : 'Confirmer le lieu'}
              variant="primary"
              onPress={handleSubmit}
              fullWidth
              disabled={!isFormValid}
              loading={isSaving}
            />
          </View>
        </BottomSheetView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopLeftRadius: scaledRadius(25),
    borderTopRightRadius: scaledRadius(25),
    overflow: 'hidden',
    shadowColor: 'rgba(88, 88, 88, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: ms(12.6, 0.4),
    elevation: 8,
  },
  handleArea: {
    paddingVertical: ms(12, 0.4),
  },
  handleTap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(12, 0.4),
  },
  handleIndicator: {
    backgroundColor: '#6d6d6d',
    width: ms(40, 0.4),
    height: ms(3, 0.3),
    borderRadius: ms(99, 0.4),
  },
  scrollContent: {
    paddingHorizontal: ms(35, 0.4),
    paddingVertical: spacing[4],
    paddingBottom: spacing[8],
  },

  // --- Shared DS components ---

  // Section group: gap-24 between sections
  sectionGroup: {
    marginBottom: ms(24, 0.4),
  },
  // Section header: DS List Item used as title
  sectionHeader: {
    paddingVertical: spacing[3],
  },
  sectionTitle: {
    fontSize: scaledFontSize(12),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    lineHeight: ms(18, 0.3),
  },
  // Card: bg #232323, rounded 8
  card: {
    backgroundColor: '#232323',
    borderRadius: scaledRadius(8),
  },
  // List Item row
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  listItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  listItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  listItemTextContainer: {
    flex: 1,
    gap: spacing[1],
  },
  // Saved place name: 12px
  listItemLabel: {
    fontSize: scaledFontSize(12),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    lineHeight: ms(18, 0.3),
  },
  // Recent place name: 14px white
  recentPlaceName: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    color: colors.white,
  },
  // Recent place address: 12px #f6f6f6
  recentPlaceAddress: {
    fontSize: scaledFontSize(12),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    lineHeight: ms(18, 0.3),
  },
  // Empty state text
  emptyText: {
    fontSize: scaledFontSize(12),
    fontFamily: 'Inter_400Regular',
    color: '#6d6d6d',
    textAlign: 'center',
    lineHeight: ms(18, 0.3),
    marginTop: spacing[8],
  },

  autocompleteList: {
    maxHeight: ms(200, 0.4),
    marginTop: spacing[2],
  },
  // "Enregistrer un lieu" — DS List Item with border primary/300
  addPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: scaledRadius(8),
    marginTop: spacing[4],
  },
  addPlaceRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  // --- Add place page (form) ---
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[4],
  },
  formHeaderTitle: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontWeight: '600',
  },
  // DS Input: label
  inputLabel: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[50],
    marginBottom: spacing[2],
    marginTop: spacing[4],
  },
  // DS Input: container — border primary/50, rounded 8, h-48
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(48, 0.5),
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(8),
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    color: colors.gray[50],
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    letterSpacing: ms(-0.32, 0.4),
  },
  inputIcon: {
    paddingRight: spacing[3],
  },
  buttonContainer: {
    marginTop: spacing[8],
  },
});
