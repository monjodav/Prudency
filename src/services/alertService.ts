import { supabase } from './supabaseClient';
import { AlertRow, AlertUpdate, TriggerAlertInput } from '@/src/types/alert';
import { sendAlertSchema } from '@/src/utils/validators';

export async function triggerAlert(input: TriggerAlertInput): Promise<AlertRow> {
  const validated = sendAlertSchema.parse(input);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase.functions.invoke<AlertRow>('send-alert', {
    body: validated,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Aucune donnée retournée par l'Edge Function");
  }

  return data;
}

export async function getAlerts(): Promise<AlertRow[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('triggered_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as AlertRow[];
}

export async function getAlertById(id: string): Promise<AlertRow> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as AlertRow;
}

export async function getActiveAlertByTripId(tripId: string): Promise<AlertRow | null> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('trip_id', tripId)
    .is('resolved_at', null)
    .order('triggered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AlertRow | null;
}

export async function resolveAlert(
  id: string,
  status: 'resolved' | 'false_alarm' = 'resolved'
): Promise<AlertRow> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const updateData: AlertUpdate = {
    status,
    resolved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('alerts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AlertRow;
}
