import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { usePlaces } from '@/src/hooks/usePlaces';
import type { SavedPlace } from '@/src/types/database';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const PLACE_TYPE_ICONS: Record<string, IoniconsName> = {
  home: 'home' as IoniconsName,
  work: 'briefcase' as IoniconsName,
  favorite: 'heart' as IoniconsName,
  other: 'location' as IoniconsName,
};

function getPlaceIcon(place: SavedPlace): IoniconsName {
  if (place.place_type && place.place_type in PLACE_TYPE_ICONS) {
    return PLACE_TYPE_ICONS[place.place_type] as IoniconsName;
  }
  return 'location' as IoniconsName;
}

export default function PlacesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { places, isLoading, deletePlace } = usePlaces();

  const handleDeletePlace = (placeId: string, placeName: string) => {
    Alert.alert(
      'Supprimer le lieu',
      `Etes-vous sur de vouloir supprimer "${placeName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlace(placeId);
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le lieu.');
            }
          },
        },
      ]
    );
  };

  const renderPlace = ({ item }: { item: SavedPlace }) => (
    <Pressable
      style={({ pressed }) => [styles.placeCard, pressed && styles.placeCardPressed]}
      onPress={() => router.push(`/(tabs)/places/${item.id}`)}
    >
      <View style={styles.placeIcon}>
        <Ionicons name={getPlaceIcon(item)} size={scaledIcon(22)} color={colors.primary[300]} />
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeletePlace(item.id, item.name)}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={scaledIcon(18)} color={colors.error[400]} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.title}>Mes lieux</Text>
        <Text style={styles.subtitle}>
          {places.length} lieu{places.length !== 1 ? 'x' : ''} enregistre{places.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary[300]} />
        </View>
      ) : places.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="location-outline" size={scaledIcon(48)} color={colors.primary[400]} />
          </View>
          <Text style={styles.emptyTitle}>Aucun lieu</Text>
          <Text style={styles.emptyDescription}>
            Enregistrez vos lieux frequents pour demarrer un trajet plus rapidement
          </Text>
          <Button
            title="Ajouter un lieu"
            onPress={() => router.push('/(tabs)/places/add')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={renderPlace}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.addButtonContainer}>
            <Button
              title="Ajouter un lieu"
              onPress={() => router.push('/(tabs)/places/add')}
              fullWidth
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
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
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[20],
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing[3],
  },
  placeCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeIcon: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  placeAddress: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  deleteButton: {
    padding: spacing[2],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[10],
  },
  emptyIconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: ms(80, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.white,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.primary[200],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  emptyButton: {
    minWidth: ms(200, 0.5),
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[6],
    backgroundColor: colors.primary[950],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
