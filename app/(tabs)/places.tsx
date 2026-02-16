import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  icon: 'home' | 'briefcase' | 'heart' | 'map-marker';
  lat: number;
  lng: number;
}

const ICON_MAP: Record<SavedPlace['icon'], React.ComponentProps<typeof FontAwesome>['name']> = {
  home: 'home',
  briefcase: 'briefcase',
  heart: 'heart',
  'map-marker': 'map-marker',
};

export default function PlacesScreen() {
  const [places, setPlaces] = useState<SavedPlace[]>([
    {
      id: '1',
      name: 'Maison',
      address: '12 Rue de la Paix, Paris',
      icon: 'home',
      lat: 48.8698,
      lng: 2.3298,
    },
    {
      id: '2',
      name: 'Travail',
      address: '45 Avenue des Champs-Elysees, Paris',
      icon: 'briefcase',
      lat: 48.8738,
      lng: 2.2950,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);

  const handleDeletePlace = (placeId: string) => {
    Alert.alert(
      'Supprimer le lieu',
      'Etes-vous sur de vouloir supprimer ce lieu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setPlaces((prev) => prev.filter((p) => p.id !== placeId));
          },
        },
      ]
    );
  };

  const handleEditPlace = (place: SavedPlace) => {
    setEditingPlace(place);
    setShowAddModal(true);
  };

  const renderPlace = ({ item }: { item: SavedPlace }) => (
    <Pressable
      style={({ pressed }) => [styles.placeCard, pressed && styles.placeCardPressed]}
      onPress={() => handleEditPlace(item)}
    >
      <View style={styles.placeIcon}>
        <FontAwesome name={ICON_MAP[item.icon]} size={20} color={colors.primary[500]} />
      </View>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeletePlace(item.id)}
        hitSlop={8}
      >
        <FontAwesome name="trash-o" size={18} color={colors.error[500]} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes lieux</Text>
        <Text style={styles.subtitle}>
          {places.length} lieu{places.length !== 1 ? 'x' : ''} enregistre{places.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {places.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="map-marker" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Aucun lieu</Text>
          <Text style={styles.emptyDescription}>
            Enregistrez vos lieux frequents pour demarrer un trajet plus rapidement
          </Text>
          <Button
            title="Ajouter un lieu"
            onPress={() => setShowAddModal(true)}
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
              onPress={() => {
                setEditingPlace(null);
                setShowAddModal(true);
              }}
              fullWidth
            />
          </View>
        </>
      )}

      <Modal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingPlace(null);
        }}
        title={editingPlace ? 'Modifier le lieu' : 'Nouveau lieu'}
      >
        <Text style={styles.modalPlaceholder}>
          Formulaire d'ajout/modification de lieu
        </Text>
        <Button
          title={editingPlace ? 'Enregistrer' : 'Ajouter'}
          onPress={() => setShowAddModal(false)}
          fullWidth
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.h3,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginTop: spacing[1],
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
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
  },
  placeCardPressed: {
    backgroundColor: colors.gray[100],
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
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
    color: colors.gray[900],
  },
  placeAddress: {
    ...typography.bodySmall,
    color: colors.gray[500],
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
  emptyTitle: {
    ...typography.h3,
    color: colors.gray[700],
    marginTop: spacing[4],
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  emptyButton: {
    minWidth: 200,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[6],
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  modalPlaceholder: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
});
