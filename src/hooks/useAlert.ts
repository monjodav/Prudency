import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as alertService from '@/src/services/alertService';
import { TriggerAlertInput } from '@/src/types/alert';

const QUERY_KEYS = {
  alerts: ['alerts'] as const,
  alert: (id: string) => ['alerts', id] as const,
};

export function useAlert() {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn: alertService.getAlerts,
  });

  const triggerAlertMutation = useMutation({
    mutationFn: (input: TriggerAlertInput) => alertService.triggerAlert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status?: 'resolved' | 'false_alarm';
    }) => alertService.resolveAlert(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    },
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
    triggerAlert: triggerAlertMutation.mutateAsync,
    isTriggering: triggerAlertMutation.isPending,
    triggerError: triggerAlertMutation.error,
    resolveAlert: resolveAlertMutation.mutateAsync,
    isResolving: resolveAlertMutation.isPending,
  };
}
