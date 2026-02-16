import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as contactService from '@/src/services/contactService';
import { ContactCreateInput, ContactUpdateInput } from '@/src/types/contact';

const QUERY_KEYS = {
  contacts: ['contacts'] as const,
  contact: (id: string) => ['contacts', id] as const,
};

export function useContacts() {
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: QUERY_KEYS.contacts,
    queryFn: contactService.getContacts,
  });

  const createContactMutation = useMutation({
    mutationFn: (input: ContactCreateInput) => contactService.createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactUpdateInput }) =>
      contactService.updateContact(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
    },
  });

  return {
    contacts: contactsQuery.data ?? [],
    isLoading: contactsQuery.isLoading,
    error: contactsQuery.error,
    refetch: contactsQuery.refetch,
    createContact: createContactMutation.mutateAsync,
    isCreating: createContactMutation.isPending,
    createError: createContactMutation.error,
    updateContact: updateContactMutation.mutateAsync,
    isUpdating: updateContactMutation.isPending,
    deleteContact: deleteContactMutation.mutateAsync,
    isDeleting: deleteContactMutation.isPending,
  };
}
