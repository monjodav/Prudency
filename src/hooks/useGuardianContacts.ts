import { useQuery } from '@tanstack/react-query';
import { getPeopleIProtect } from '@/src/services/contactService';

export function useGuardianContacts() {
  const query = useQuery({
    queryKey: ['guardian-contacts'],
    queryFn: getPeopleIProtect,
  });

  return {
    guardianContacts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
