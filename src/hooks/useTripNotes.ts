import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tripNotesService from '@/src/services/tripNotesService';
import type { CreateNoteInput } from '@/src/services/tripNotesService';

const QUERY_KEYS = {
  tripNotes: (tripId: string) => ['trip-notes', tripId] as const,
};

export function useTripNotes(tripId: string | null) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: QUERY_KEYS.tripNotes(tripId ?? ''),
    queryFn: () => tripNotesService.getTripNotes(tripId!),
    enabled: !!tripId,
  });

  const createNoteMutation = useMutation({
    mutationFn: (input: Omit<CreateNoteInput, 'tripId'>) =>
      tripNotesService.createTripNote({ ...input, tripId: tripId! }),
    onSuccess: () => {
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tripNotes(tripId) });
      }
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      tripNotesService.updateTripNote(noteId, content),
    onSuccess: () => {
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tripNotes(tripId) });
      }
    },
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    refetch: notesQuery.refetch,
    createNote: createNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    updateNote: updateNoteMutation.mutateAsync,
    isUpdating: updateNoteMutation.isPending,
  };
}
