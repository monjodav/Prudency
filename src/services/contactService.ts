import { supabase } from './supabaseClient';
import {
  TrustedContactRow,
  TrustedContactInsert,
  TrustedContactUpdate,
  ContactCreateInput,
  ContactUpdateInput,
} from '@/src/types/contact';
import { createContactSchema } from '@/src/utils/validators';

export async function getContacts(): Promise<TrustedContactRow[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data as TrustedContactRow[];
}

export async function getContactById(id: string): Promise<TrustedContactRow> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as TrustedContactRow;
}

export async function createContact(
  input: ContactCreateInput
): Promise<TrustedContactRow> {
  const validated = createContactSchema.parse(input);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const insertData: TrustedContactInsert = {
    user_id: user.id,
    name: validated.name,
    phone: validated.phone,
    is_primary: validated.isPrimary,
    validation_status: 'pending',
  };

  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TrustedContactRow;
}

export async function updateContact(
  id: string,
  input: ContactUpdateInput
): Promise<TrustedContactRow> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData: TrustedContactUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.isPrimary !== undefined) updateData.is_primary = input.isPrimary;
  if (input.isFavorite !== undefined) updateData.is_favorite = input.isFavorite;

  const { data, error } = await supabase
    .from('trusted_contacts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TrustedContactRow;
}

export async function respondToContactInvitation(
  token: string,
  response: 'accepted' | 'refused',
): Promise<{ success?: boolean; contactName?: string; error?: string }> {
  // @ts-expect-error -- respond_to_invitation not yet in generated types
  const { data, error } = await supabase.rpc('respond_to_invitation', {
    p_token: token,
    p_response: response,
  });

  if (error) throw error;
  const result = data as { success?: boolean; contactName?: string; error?: string };
  if (result.error) throw new Error(result.error);
  return result;
}

export async function deleteContact(id: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}
