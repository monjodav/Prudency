import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ContextMenu } from '@/src/components/ui/ContextMenu';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { formatTime } from '@/src/utils/formatters';
import { useTripStore } from '@/src/stores/tripStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTripNotes } from '@/src/hooks/useTripNotes';
import { TripNote } from '@/src/types/database';
import { scaledIcon, ms } from '@/src/utils/scaling';

const AVATAR_SIZE = ms(36, 0.5);

function getUserInitial(email: string | null | undefined): string {
  if (!email) return 'U';
  return email.charAt(0).toUpperCase();
}

function getUserDisplayName(email: string | null | undefined): string {
  if (!email) return 'Utilisateur';
  const local = email.split('@')[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function TripNotesScreen() {
  const { lastKnownLat, lastKnownLng } = useTripStore();
  const user = useAuthStore((s) => s.user);
  const { trip } = useActiveTrip();
  const {
    notes, isLoading, createNote, isCreating, updateNote, isUpdating,
  } = useTripNotes(trip?.id ?? null);

  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; title: string }>({
    visible: false,
    title: '',
  });

  const displayName = getUserDisplayName(user?.email);
  const initial = getUserInitial(user?.email);

  const handleSend = useCallback(async () => {
    const text = noteText.trim();
    if (!text || !trip) return;

    try {
      if (editingNoteId) {
        await updateNote({ noteId: editingNoteId, content: text });
        setSnackbar({ visible: true, title: 'Commentaire modifie' });
        setEditingNoteId(null);
      } else {
        await createNote({
          content: text,
          lat: lastKnownLat ?? undefined,
          lng: lastKnownLng ?? undefined,
        });
      }
      setNoteText('');
    } catch {
      // Error handled by mutation
    }
  }, [noteText, trip, editingNoteId, updateNote, createNote, lastKnownLat, lastKnownLng]);

  const handleEdit = useCallback((note: TripNote) => {
    setEditingNoteId(note.id);
    setNoteText(note.content);
  }, []);

  const renderNote = useCallback(({ item }: { item: TripNote }) => (
    <View style={styles.noteRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.noteBubble}>
        <View style={styles.noteTopRow}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.noteTime}>
            {formatTime(item.created_at ?? new Date().toISOString())}
          </Text>
        </View>
        <Text style={styles.noteContent}>{item.content}</Text>
      </View>
      <ContextMenu
        items={[
          {
            label: 'Modifier',
            icon: 'pencil-outline',
            onPress: () => handleEdit(item),
          },
        ]}
      />
    </View>
  ), [initial, displayName, handleEdit]);

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
          <Ionicons name="document-text-outline" size={scaledIcon(48)} color={colors.gray[600]} />
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
        {editingNoteId && (
          <View style={styles.editingBanner}>
            <Ionicons name="pencil" size={scaledIcon(14)} color={colors.secondary[400]} />
            <Text style={styles.editingText}>Modification en cours</Text>
            <Pressable
              onPress={() => { setEditingNoteId(null); setNoteText(''); }}
              hitSlop={8}
            >
              <Ionicons name="close" size={scaledIcon(16)} color={colors.gray[400]} />
            </Pressable>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ajouter une note"
            placeholderTextColor={colors.gray[500]}
            value={noteText}
            onChangeText={setNoteText}
            style={styles.textInput}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!noteText.trim() || isCreating || isUpdating}
            style={[
              styles.sendButton,
              (!noteText.trim() || isCreating || isUpdating) && styles.sendButtonDisabled,
            ]}
          >
            <Ionicons name="send" size={scaledIcon(18)} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <Snackbar
        visible={snackbar.visible}
        title={snackbar.title}
        variant="success"
        onHide={() => setSnackbar({ visible: false, title: '' })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[950],
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  noteBubble: {
    flex: 1,
  },
  noteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  userName: {
    ...typography.bodySmall,
    color: colors.gray[100],
    fontWeight: '600',
  },
  noteTime: {
    ...typography.caption,
    color: colors.gray[500],
  },
  noteContent: {
    ...typography.body,
    color: colors.gray[200],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[10],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray[300],
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
    backgroundColor: colors.primary[900],
    borderTopWidth: 1,
    borderTopColor: colors.primary[800],
    padding: spacing[3],
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
  },
  editingText: {
    ...typography.caption,
    color: colors.secondary[400],
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    backgroundColor: colors.primary[800],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    maxHeight: ms(100, 0.5),
  },
  sendButton: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: ms(20, 0.5),
    backgroundColor: colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
