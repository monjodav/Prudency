import { supabase } from './supabaseClient';
import { AlertRow, AlertUpdate, TriggerAlertInput } from '@/src/types/alert';
import { sendAlertSchema } from '@/src/utils/validators';

const ALERT_MAX_RETRIES = 3;
const ALERT_BASE_DELAY_MS = 1_000;

export async function triggerAlert(input: TriggerAlertInput): Promise<AlertRow> {
  const validated = sendAlertSchema.parse(input);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= ALERT_MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke<AlertRow>('send-alert', {
        body: validated,
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Aucune donnee retournee par l'Edge Function");
      }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < ALERT_MAX_RETRIES) {
        const delay = ALERT_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error("Echec de l'envoi de l'alerte apres plusieurs tentatives");
}

export async function getAlerts(
  limit = 50,
  offset = 0,
): Promise<AlertRow[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('triggered_at', { ascending: false })
    .range(offset, offset + limit - 1);

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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecté');
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
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
