import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius, scaledFontSize } from '@/src/utils/scaling';
import { Button } from '@/src/components/ui/Button';
import { useAddPlace } from '@/src/hooks/useAddPlace';
import { usePlaces } from '@/src/hooks/usePlaces';
import type { SavedPlace } from '@/src/types/database';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';

interface AddPlaceBottomSheetProps {
  onSaveSuccess: (place: SavedPlace) => void;
  onSaveError: () => void;
  onPlaceSelected?: (coords: { lat: number; lng: number }) => void;
}

export const AddPlaceBottomSheet = forwardRef<BottomSheetModal, AddPlaceBottomSheetProps>(
  function AddPlaceBottomSheet({ onSaveSuccess, onSaveError, onPlaceSelected }, ref) {
    const snapPoints = useMemo(() => ['85%'], []);
    const { places } = usePlaces();
    const {
      searchQuery,
      searchResults,
      isSearching,
      name,
      setName,
      selectedPlace,
      isFormValid,
      isSaving,
      handleSearch,
      handleSelectResult,
      handleSelectRecentPlace,
      handleSave,
      reset,
    } = useAddPlace();

    const recentPlaces = useMemo(
      () => places.slice(0, 5),
      [places],
    );

    const handleDismiss = useCallback(() => {
      reset();
    }, [reset]);

    const handleClose = useCallback(() => {
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    }, [ref]);

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
          onSaveSuccess(saved);
          handleClose();
        }
      } catch {
        onSaveError();
      }
    }, [handleSave, onSaveSuccess, onSaveError, handleClose]);

    const showAutocomplete = searchResults.length > 0 && !selectedPlace;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
        onDismiss={handleDismiss}
        enablePanDownToClose
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Enregistrer un lieu</Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={scaledIcon(24)} color={colors.white} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Address field */}
          <Text style={styles.label}>Adresse</Text>
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              style={styles.textInput}
              placeholder="Rechercher une adresse"
              placeholderTextColor={colors.gray[500]}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary[300]} style={styles.inputIcon} />
            ) : (
              <Ionicons name="search" size={scaledIcon(18)} color={colors.gray[400]} style={styles.inputIcon} />
            )}
          </View>

          {/* Autocomplete results */}
          {showAutocomplete && (
            <View style={styles.autocompleteList}>
              {searchResults.map((result) => (
                <Pressable
                  key={result.placeId}
                  style={({ pressed }) => [styles.autocompleteRow, pressed && styles.rowPressed]}
                  onPress={() => handleSelectAutocomplete(result)}
                >
                  <Ionicons name="location-outline" size={scaledIcon(16)} color={colors.primary[300]} />
                  <View style={styles.autocompleteText}>
                    <Text style={styles.autocompleteMain} numberOfLines={1}>{result.mainText}</Text>
                    <Text style={styles.autocompleteSecondary} numberOfLines={1}>{result.secondaryText}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Name field */}
          <Text style={styles.label}>Nomme le lieu</Text>
          <BottomSheetTextInput
            style={styles.textInput}
            placeholder="Maison"
            placeholderTextColor={colors.gray[500]}
            value={name}
            onChangeText={setName}
          />

          {/* Recent places */}
          {recentPlaces.length > 0 && !showAutocomplete && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Trajets récents</Text>
              {recentPlaces.map((place) => (
                <Pressable
                  key={place.id}
                  style={({ pressed }) => [styles.recentRow, pressed && styles.rowPressed]}
                  onPress={() => handleSelectRecent(place)}
                >
                  <View style={styles.recentDot} />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.recentAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Save button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Enregistrer le lieu"
              variant="success"
              onPress={handleSubmit}
              fullWidth
              disabled={!isFormValid}
              loading={isSaving}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.primary[950],
    borderTopLeftRadius: scaledRadius(20),
    borderTopRightRadius: scaledRadius(20),
  },
  handleIndicator: {
    backgroundColor: colors.gray[500],
    width: ms(40, 0.4),
    height: ms(4, 0.3),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  headerTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  label: {
    ...typography.caption,
    color: colors.gray[300],
    marginBottom: spacing[1],
    marginTop: spacing[4],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scaledRadius(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: scaledFontSize(15),
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  inputIcon: {
    paddingRight: spacing[3],
  },
  autocompleteList: {
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scaledRadius(12),
    overflow: 'hidden',
  },
  autocompleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  autocompleteText: {
    flex: 1,
  },
  autocompleteMain: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '500',
  },
  autocompleteSecondary: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
  recentSection: {
    marginTop: spacing[6],
  },
  recentTitle: {
    ...typography.caption,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: scaledFontSize(1),
    marginBottom: spacing[2],
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  recentDot: {
    width: ms(8, 0.4),
    height: ms(8, 0.4),
    borderRadius: ms(4, 0.4),
    backgroundColor: colors.primary[400],
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  recentAddress: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: spacing[8],
  },
});
