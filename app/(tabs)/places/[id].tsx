import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { usePlaces } from '@/src/hooks/usePlaces';
import { figmaScale, scaledIcon, scaledRadius, ms } from '@/src/utils/scaling';

type PlaceType = 'home' | 'work' | 'favorite' | 'other';
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface PlaceTypeOption {
  value: PlaceType;
  label: string;
  icon: IoniconsName;
}

const PLACE_TYPES: PlaceTypeOption[] = [
  { value: 'home', label: 'Maison', icon: 'home' },
  { value: 'work', label: 'Travail', icon: 'briefcase' },
  { value: 'favorite', label: 'Favori', icon: 'heart' },
  { value: 'other', label: 'Autre', icon: 'location' },
];

export default function EditPlaceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPlace, updatePlace, deletePlace } = usePlaces();

  const place = id ? getPlace(id) : undefined;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [placeType, setPlaceType] = useState<PlaceType>('other');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (place) {
      setName(place.name);
      setAddress(place.address);
      setPlaceType((place.place_type as PlaceType) ?? 'other');
      setLatitude(place.latitude);
      setLongitude(place.longitude);
    }
  }, [place]);

  const handleSearchAddress = async () => {
    if (!address.trim()) return;
    setIsGeocoding(true);
    setErrors((prev) => ({ ...prev, address: '' }));

    try {
      const results = await Location.geocodeAsync(address);
      const firstResult = results[0];
      if (firstResult) {
        setLatitude(firstResult.latitude);
        setLongitude(firstResult.longitude);
      } else {
        setErrors((prev) => ({ ...prev, address: 'Adresse introuvable' }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        address: 'Erreur lors de la recherche',
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Nom requis';
    }
    if (!address.trim()) {
      newErrors.address = 'Adresse requise';
    }
    if (latitude === null || longitude === null) {
      newErrors.address = newErrors.address || 'Recherchez l\'adresse pour valider la position';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !id || latitude === null || longitude === null) return;
    setIsSaving(true);

    try {
      await updatePlace(id, {
        name: name.trim(),
        address: address.trim(),
        latitude,
        longitude,
        place_type: placeType,
        icon: placeType,
      });
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Supprimer le lieu',
      `Etes-vous sur de vouloir supprimer "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlace(id);
              router.back();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le lieu.');
            }
          },
        },
      ]
    );
  };

  if (!place) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + spacing[8] }]}>
          <ActivityIndicator size="large" color={colors.primary[300]} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const isFormValid = name.trim() !== '' && address.trim() !== '' && latitude !== null;

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={scaledIcon(24)} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Modifier le lieu</Text>
        <Pressable style={styles.deleteHeaderButton} onPress={handleDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={scaledIcon(22)} color={colors.error[400]} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Place type selector */}
          <Text style={styles.sectionLabel}>Type de lieu</Text>
          <View style={styles.typeGrid}>
            {PLACE_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={[
                  styles.typeOption,
                  placeType === type.value && styles.typeOptionSelected,
                ]}
                onPress={() => setPlaceType(type.value)}
              >
                <Ionicons
                  name={type.icon}
                  size={scaledIcon(24)}
                  color={placeType === type.value ? colors.white : colors.primary[300]}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    placeType === type.value && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Name input */}
          <Input
            label="Nom du lieu"
            placeholder="Ex: Maison, Bureau, Salle de sport..."
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            variant="dark"
          />

          {/* Address input with search */}
          <View style={styles.addressContainer}>
            <Input
              label="Adresse"
              placeholder="Rechercher une adresse..."
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                setLatitude(null);
                setLongitude(null);
              }}
              error={errors.address}
              variant="dark"
              onSubmitEditing={handleSearchAddress}
              returnKeyType="search"
            />
            <Pressable
              style={[styles.searchButton, isGeocoding && styles.searchButtonDisabled]}
              onPress={handleSearchAddress}
              disabled={isGeocoding || !address.trim()}
            >
              {isGeocoding ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="search" size={scaledIcon(20)} color={colors.white} />
              )}
            </Pressable>
          </View>

          {/* Location confirmation */}
          {latitude !== null && longitude !== null && (
            <View style={styles.locationConfirmed}>
              <Ionicons name="checkmark-circle" size={scaledIcon(20)} color={colors.success[400]} />
              <Text style={styles.locationText}>
                Position trouvee ({latitude.toFixed(4)}, {longitude.toFixed(4)})
              </Text>
            </View>
          )}

          {/* Map placeholder */}
          <View style={styles.mapPreview}>
            <Ionicons name="map-outline" size={scaledIcon(48)} color={colors.primary[400]} />
            <Text style={styles.mapPreviewText}>
              {latitude !== null
                ? 'Apercu de la carte'
                : 'Recherchez une adresse pour voir la carte'}
            </Text>
          </View>

          {/* Delete button */}
          <Pressable
            style={({ pressed }) => [styles.deleteSection, pressed && styles.deleteSectionPressed]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={scaledIcon(18)} color={colors.error[400]} />
            <Text style={styles.deleteSectionText}>Supprimer ce lieu</Text>
          </Pressable>
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            loading={isSaving}
            disabled={!isFormValid}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  flex: {
    flex: 1,
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  loadingText: {
    ...typography.body,
    color: colors.primary[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  backButton: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: ms(40, 0.5) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteHeaderButton: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: ms(40, 0.5) / 2,
    backgroundColor: 'rgba(202, 31, 31, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  sectionLabel: {
    ...typography.label,
    color: colors.primary[200],
    marginBottom: spacing[3],
  },
  typeGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing[2],
  },
  typeOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[400],
  },
  typeLabel: {
    ...typography.caption,
    color: colors.primary[200],
  },
  typeLabelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  addressContainer: {
    position: 'relative',
  },
  searchButton: {
    position: 'absolute',
    right: ms(4, 0.5),
    top: ms(30, 0.5),
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: scaledRadius(8),
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  locationConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: 'rgba(48, 196, 102, 0.1)',
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.success[400],
  },
  mapPreview: {
    height: ms(180, 0.5),
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
  },
  mapPreviewText: {
    ...typography.bodySmall,
    color: colors.primary[300],
    textAlign: 'center',
  },
  deleteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    marginTop: spacing[6],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(202, 31, 31, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(202, 31, 31, 0.15)',
    gap: spacing[2],
  },
  deleteSectionPressed: {
    opacity: 0.7,
  },
  deleteSectionText: {
    ...typography.body,
    color: colors.error[400],
    fontWeight: '600',
  },
  footer: {
    padding: spacing[6],
    backgroundColor: colors.primary[950],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
