import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';

interface NoteItem {
  id: string;
  time: string;
  content?: string;
}

interface NoteSectionProps {
  notes: NoteItem[];
  onAddNote: () => void;
  onEditNote?: (noteId: string) => void;
  style?: ViewStyle;
}

export function NoteSection({
  notes,
  onAddNote,
  onEditNote,
  style,
}: NoteSectionProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionLabel}>Note</Text>

      <Pressable onPress={onAddNote} style={styles.addNoteInput}>
        <View style={styles.inputRow}>
          <Text style={styles.inputPlaceholder}>Ajouter une nouvelle note</Text>
          <Ionicons
            name="pencil"
            size={scaledIcon(24)}
            color={colors.gray[50]}
          />
        </View>
      </Pressable>

      {notes.map((note) => (
        <Pressable
          key={note.id}
          onPress={() => onEditNote?.(note.id)}
          style={styles.noteItem}
        >
          <View style={styles.inputRow}>
            <Text style={styles.noteTime}>{note.time}</Text>
            <Ionicons
              name="pencil"
              size={scaledIcon(24)}
              color={colors.gray[50]}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.button.disabledText,
    lineHeight: ms(18, 0.4),
  },
  addNoteInput: {
    borderWidth: 1,
    borderColor: colors.gray[50],
    borderRadius: borderRadius.md,
    height: ms(48, 0.5),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputPlaceholder: {
    ...typography.bodySmall,
    color: colors.gray[50],
    flex: 1,
    letterSpacing: ms(-0.32, 0.4),
  },
  noteItem: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[400],
    borderRadius: borderRadius.md,
    height: ms(48, 0.5),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    justifyContent: 'center',
  },
  noteTime: {
    ...typography.bodySmall,
    color: colors.gray[50],
    flex: 1,
    letterSpacing: ms(-0.32, 0.4),
  },
});
