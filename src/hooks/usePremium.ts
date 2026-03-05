import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as premiumService from '@/src/services/premiumService';

const QUERY_KEYS = {
  premiumStatus: ['premium-status'] as const,
};

const FREE_LIMITS = {
  maxContacts: 1,
  maxNotesPerTrip: 5,
  notesEncrypted: false,
  anomalyDetection: false,
} as const;

const PREMIUM_LIMITS = {
  maxContacts: 5,
  maxNotesPerTrip: 20,
  notesEncrypted: true,
  anomalyDetection: true,
} as const;

export type PremiumLimits = typeof FREE_LIMITS;

export function usePremium() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: QUERY_KEYS.premiumStatus,
    queryFn: premiumService.getPremiumStatus,
    staleTime: 5 * 60 * 1000,
  });

  const activateMutation = useMutation({
    mutationFn: premiumService.activatePremium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.premiumStatus });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: premiumService.deactivatePremium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.premiumStatus });
    },
  });

  const isPremium = statusQuery.data?.isPremium ?? false;
  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  function canAddContact(currentCount: number): boolean {
    return currentCount < limits.maxContacts;
  }

  function canAddNote(currentCount: number): boolean {
    return currentCount < limits.maxNotesPerTrip;
  }

  function requiresPremium(feature: keyof PremiumLimits): boolean {
    return FREE_LIMITS[feature] !== PREMIUM_LIMITS[feature] && !isPremium;
  }

  return {
    isPremium,
    premiumSince: statusQuery.data?.premiumSince ?? null,
    isLoading: statusQuery.isLoading,
    limits,
    canAddContact,
    canAddNote,
    requiresPremium,
    activate: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    deactivate: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
  };
}
