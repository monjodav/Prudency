import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as guardianService from '@/src/services/guardianService';

const QUERY_KEYS = {
  protectedPersons: ['guardian', 'protected-persons'] as const,
  alertDetail: (id: string) => ['guardian', 'alert', id] as const,
  tripDetail: (id: string) => ['guardian', 'trip', id] as const,
};

export function useProtectedPersons() {
  const query = useQuery({
    queryKey: QUERY_KEYS.protectedPersons,
    queryFn: guardianService.getProtectedPersons,
    refetchInterval: 30_000,
  });

  return {
    persons: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGuardianAlertDetail(alertId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.alertDetail(alertId ?? ''),
    queryFn: () => guardianService.getGuardianAlertDetail(alertId!),
    enabled: !!alertId,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGuardianTripDetail(tripId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.tripDetail(tripId ?? ''),
    queryFn: () => guardianService.getGuardianTripDetail(tripId!),
    enabled: !!tripId,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: guardianService.acknowledgeAlert,
    onSuccess: (_data, alertId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alertDetail(alertId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.protectedPersons });
    },
  });

  return {
    acknowledge: mutation.mutateAsync,
    isAcknowledging: mutation.isPending,
    error: mutation.error,
  };
}
