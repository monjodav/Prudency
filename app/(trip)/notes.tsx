import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { formatTime } from '@/src/utils/formatters';

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
  lat?: number;
  lng?: number;
}

export default function TripNotesScreen() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    // Placeholder: will use useTrip hook
    const note: NoteItem = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote('');
  };

  const renderNote = ({ item }: { item: NoteItem }) => (
    <Card style={styles.noteCard}>
      <Text style={styles.noteContent}>{item.content}</Text>
      <View style={styles.noteMeta}>
        <FontAwesome name="clock-o" size={12} color={colors.gray[400]} />
        <Text style={styles.noteTime}>{formatTime(item.createdAt)}</Text>
        {item.lat != null && item.lng != null && (
          <>
            <FontAwesome name="map-marker" size={12} color={colors.gray[400]} />
            <Text style={styles.noteLocation}>
              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
            </Text>
          </>
        )}
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="pencil-square-o" size={48} color={colors.gray[300]} />
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
        <View style={styles.inputRow}>
          <Input
            placeholder="Ecrire une note..."
            value={newNote}
            onChangeText={setNewNote}
            containerStyle={styles.inputField}
            multiline
          />
          <Button
            title="Envoyer"
            size="sm"
            onPress={handleAddNote}
            disabled={!newNote.trim()}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  noteContent: {
    ...typography.body,
    color: colors.gray[800],
    marginBottom: spacing[2],
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
