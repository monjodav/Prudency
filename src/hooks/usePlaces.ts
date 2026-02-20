import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savedPlacesService from '@/src/services/savedPlacesService';
import type { CreatePlaceInput, UpdatePlaceInput } from '@/src/services/savedPlacesService';
import type { SavedPlace } from '@/src/types/database';
import { useAuthStore } from '@/src/stores/authStore';

const PLACES_QUERY_KEY = ['places'];

export function usePlaces() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const placesQuery = useQuery({
    queryKey: PLACES_QUERY_KEY,
    queryFn: savedPlacesService.getSavedPlaces,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreatePlaceInput) => savedPlacesService.createSavedPlace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLACES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePlaceInput }) =>
      savedPlacesService.updateSavedPlace(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLACES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: savedPlacesService.deleteSavedPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLACES_QUERY_KEY });
    },
  });

  const getPlace = useCallback(
    (id: string): SavedPlace | undefined => {
      return placesQuery.data?.find((p) => p.id === id);
    },
    [placesQuery.data],
  );

  return {
    places: placesQuery.data ?? [],
    isLoading: placesQuery.isLoading,
    error: placesQuery.error?.message ?? null,
    refetch: placesQuery.refetch,
    addPlace: createMutation.mutateAsync,
    isAddingPlace: createMutation.isPending,
    addPlaceError: createMutation.error,
    updatePlace: (id: string, input: UpdatePlaceInput) =>
      updateMutation.mutateAsync({ id, input }),
    isUpdatingPlace: updateMutation.isPending,
    updatePlaceError: updateMutation.error,
    deletePlace: deleteMutation.mutateAsync,
    isDeletingPlace: deleteMutation.isPending,
    deletePlaceError: deleteMutation.error,
    getPlace,
  };
}
