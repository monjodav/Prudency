import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { formatTime } from '@/src/utils/formatters';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTripNotes } from '@/src/hooks/useTripNotes';
import { TripNote } from '@/src/types/database';
import { scaledIcon } from '@/src/utils/scaling';

export default function TripNotesScreen() {
  const { lastKnownLat, lastKnownLng } = useTripStore();
  const { trip } = useActiveTrip();
  const { notes, isLoading, createNote, isCreating } = useTripNotes(trip?.id ?? null);
  const [newNote, setNewNote] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !trip) return;

    try {
      await createNote({
        content: newNote.trim(),
        lat: lastKnownLat ?? undefined,
        lng: lastKnownLng ?? undefined,
      });
      setNewNote('');
    } catch {
      // Error handled by mutation
    }
  };

  const renderNote = ({ item }: { item: TripNote }) => (
    <Card style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteContent}>{item.content}</Text>
      </View>
      <View style={styles.noteMeta}>
        <Ionicons name="time-outline" size={scaledIcon(12)} color={colors.gray[400]} />
        <Text style={styles.noteTime}>{formatTime(item.created_at ?? new Date().toISOString())}</Text>
        {item.lat != null && item.lng != null && (
          <>
            <Ionicons name="location-outline" size={scaledIcon(12)} color={colors.gray[400]} />
            <Text style={styles.noteLocation}>
              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
            </Text>
          </>
        )}
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={scaledIcon(48)} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Aucune note</Text>
          <Text style={styles.emptyDescription}>
            Ajoutez des notes pendant votre trajet pour garder une trace
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
        <View style={styles.encryptRow}>
          <View style={styles.encryptLabel}>
            <Ionicons
              name={isEncrypted ? 'lock-closed' : 'lock-open-outline'}
              size={scaledIcon(16)}
              color={isEncrypted ? colors.secondary[500] : colors.gray[400]}
            />
            <Text style={styles.encryptText}>Chiffrer la note</Text>
          </View>
          <Switch
            value={isEncrypted}
            onValueChange={setIsEncrypted}
            trackColor={{
              false: colors.gray[200],
              true: colors.secondary[200],
            }}
            thumbColor={isEncrypted ? colors.secondary[500] : colors.gray[400]}
          />
        </View>
        <View style={styles.inputRow}>
          <Input
            placeholder="Ecrire une note..."
            value={newNote}
            onChangeText={setNewNote}
            containerStyle={styles.inputField}
            multiline
            variant="light"
          />
          <Button
            title="Envoyer"
            size="sm"
            onPress={handleAddNote}
            disabled={!newNote.trim() || isCreating}
            loading={isCreating}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  noteCard: {
    marginBottom: spacing[3],
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  noteContent: {
    ...typography.body,
    color: colors.gray[800],
    flex: 1,
    marginRight: spacing[2],
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  noteTime: {
    ...typography.caption,
    color: colors.gray[500],
  },
  noteLocation: {
    ...typography.caption,
    color: colors.gray[500],
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
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: spacing[4],
  },
  encryptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  encryptLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  encryptText: {
    ...typography.caption,
    color: colors.gray[600],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  inputField: {
    flex: 1,
    marginBottom: 0,
  },
});
