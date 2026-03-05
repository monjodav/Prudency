import { useQuery } from '@tanstack/react-query';
import * as historyService from '@/src/services/historyService';

const QUERY_KEYS = {
  pastTrips: ['history', 'trips'] as const,
  pastTrip: (id: string) => ['history', 'trips', id] as const,
  tripLocations: (tripId: string) => ['history', 'locations', tripId] as const,
  tripAlerts: (tripId: string) => ['history', 'alerts', 'trip', tripId] as const,
  pastAlerts: ['history', 'alerts'] as const,
  pastAlert: (id: string) => ['history', 'alerts', id] as const,
};

export function usePastTrips() {
  const query = useQuery({
    queryKey: QUERY_KEYS.pastTrips,
    queryFn: () => historyService.getPastTrips(),
  });

  return {
    trips: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePastTripDetail(id: string) {
  const tripQuery = useQuery({
    queryKey: QUERY_KEYS.pastTrip(id),
    queryFn: () => historyService.getPastTripById(id),
    enabled: !!id,
  });

  const locationsQuery = useQuery({
    queryKey: QUERY_KEYS.tripLocations(id),
    queryFn: () => historyService.getTripLocations(id),
    enabled: !!id,
  });

  const alertsQuery = useQuery({
    queryKey: QUERY_KEYS.tripAlerts(id),
    queryFn: () => historyService.getAlertsByTripId(id),
    enabled: !!id,
  });

  return {
    trip: tripQuery.data ?? null,
    locations: locationsQuery.data ?? [],
    alerts: alertsQuery.data ?? [],
    isLoading: tripQuery.isLoading || locationsQuery.isLoading,
    error: tripQuery.error ?? locationsQuery.error,
  };
}

export function usePastAlerts() {
  const query = useQuery({
    queryKey: QUERY_KEYS.pastAlerts,
    queryFn: () => historyService.getPastAlerts(),
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePastAlertDetail(id: string) {
  const alertQuery = useQuery({
    queryKey: QUERY_KEYS.pastAlert(id),
    queryFn: () => historyService.getPastAlertById(id),
    enabled: !!id,
  });

  return {
    alert: alertQuery.data ?? null,
    isLoading: alertQuery.isLoading,
    error: alertQuery.error,
  };
}
