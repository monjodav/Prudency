import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as tripService from '@/src/services/tripService';
import { useTripStore } from '@/src/stores/tripStore';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import { TripRow } from '@/src/types/trip';

export function useActiveTrip() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const { setActiveTrip } = useTripStore();

  const activeTripQuery = useQuery({
    queryKey: ['trips', 'active'],
    queryFn: tripService.getActiveTrip,
    enabled: !!session,
    refetchInterval: 30_000,
  });

  const trip = activeTripQuery.data ?? null;

  useEffect(() => {
    setActiveTrip(trip?.id ?? null);
  }, [trip?.id, setActiveTrip]);

  useEffect(() => {
    if (!session || !trip) {
      return;
    }

    const channel = supabase
      .channel(`trip-${trip.id}`)
      .on<TripRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${trip.id}`,
        },
        (payload) => {
          queryClient.setQueryData(['trips', 'active'], payload.new);
          queryClient.invalidateQueries({ queryKey: ['trips'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, trip?.id, queryClient]);

  const remainingMinutes = useMemo(() => {
    if (!trip?.estimated_arrival_at) {
      return 0;
    }
    const arrival = new Date(trip.estimated_arrival_at).getTime();
    const now = Date.now();
    return Math.max(0, Math.round((arrival - now) / (1000 * 60)));
  }, [trip?.estimated_arrival_at]);

  const isOvertime = useMemo(() => {
    if (!trip?.estimated_arrival_at) {
      return false;
    }
    return Date.now() > new Date(trip.estimated_arrival_at).getTime();
  }, [trip?.estimated_arrival_at]);

  return {
    trip,
    isLoading: activeTripQuery.isLoading,
    error: activeTripQuery.error,
    remainingMinutes,
    isOvertime,
    hasActiveTrip: !!trip,
    refetch: activeTripQuery.refetch,
  };
}
