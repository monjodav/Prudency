import { useQuery } from '@tanstack/react-query';
import { getSavedPlaces } from '@/src/services/savedPlacesService';

const QUERY_KEY = ['saved-places'] as const;

export function useSavedPlaces() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getSavedPlaces,
  });

  return {
    places: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
