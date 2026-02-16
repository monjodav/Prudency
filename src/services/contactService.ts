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
  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('id', id)
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
    email: validated.email || null,
    is_primary: validated.isPrimary,
    notify_by_push: validated.notifyByPush,
    notify_by_sms: validated.notifyBySms,
  };

  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert(insertData as never)
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
  const updateData: TrustedContactUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.email !== undefined) updateData.email = input.email || null;
  if (input.isPrimary !== undefined) updateData.is_primary = input.isPrimary;
  if (input.notifyByPush !== undefined) updateData.notify_by_push = input.notifyByPush;
  if (input.notifyBySms !== undefined) updateData.notify_by_sms = input.notifyBySms;

  const { data, error } = await supabase
    .from('trusted_contacts')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TrustedContactRow;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
