import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tripService from '@/src/services/tripService';
import type { CreateTripInput } from '@/src/services/tripService';

const QUERY_KEYS = {
  trips: ['trips'] as const,
  trip: (id: string) => ['trips', id] as const,
  activeTrip: ['trips', 'active'] as const,
};

export function useTrip() {
  const queryClient = useQueryClient();

  const tripsQuery = useQuery({
    queryKey: QUERY_KEYS.trips,
    queryFn: tripService.getTrips,
  });

  const createTripMutation = useMutation({
    mutationFn: (input: CreateTripInput) => tripService.createTrip(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeTrip });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof tripService.updateTrip>[1];
    }) => tripService.updateTrip(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      queryClient.setQueryData(QUERY_KEYS.trip(data.id), data);
    },
  });

  const cancelTripMutation = useMutation({
    mutationFn: (id: string) => tripService.cancelTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeTrip });
    },
  });

  const completeTripMutation = useMutation({
    mutationFn: (id: string) => tripService.completeTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeTrip });
    },
  });

  const extendTripMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      tripService.extendTrip(id, minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeTrip });
    },
  });

  return {
    trips: tripsQuery.data ?? [],
    isLoading: tripsQuery.isLoading,
    error: tripsQuery.error,
    refetch: tripsQuery.refetch,
    createTrip: createTripMutation.mutateAsync,
    isCreating: createTripMutation.isPending,
    createError: createTripMutation.error,
    updateTrip: updateTripMutation.mutateAsync,
    isUpdating: updateTripMutation.isPending,
    cancelTrip: cancelTripMutation.mutateAsync,
    isCancelling: cancelTripMutation.isPending,
    completeTrip: completeTripMutation.mutateAsync,
    isCompleting: completeTripMutation.isPending,
    extendTrip: extendTripMutation.mutateAsync,
    isExtending: extendTripMutation.isPending,
  };
}
