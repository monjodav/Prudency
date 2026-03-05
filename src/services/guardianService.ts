import { supabase } from './supabaseClient';
import type { AlertRow } from '@/src/types/alert';
import type { Database } from '@/src/types/database';

type TripRow = Database['public']['Tables']['trips']['Row'];
type TrustedContactRow = Database['public']['Tables']['trusted_contacts']['Row'];

export interface ProtectedPerson {
  contactId: string;
  name: string;
  phone: string;
  userId: string;
  activeTrip: TripRow | null;
  activeAlert: AlertRow | null;
}

export interface GuardianAlertDetail {
  alert: AlertRow;
  trip: TripRow;
  person: {
    name: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
  };
}

/**
 * Fetches all protected persons for the current guardian user.
 * A protected person is someone who added the guardian as a trusted contact (matched by phone).
 */
export async function getProtectedPersons(): Promise<ProtectedPerson[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw authError ?? new Error('Utilisateur non connecte');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.phone) {
    return [];
  }

  const { data: rawContacts, error: contactsError } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('phone', profile.phone)
    .eq('validation_status', 'accepted');

  if (contactsError) {
    throw contactsError;
  }

  const contacts = (rawContacts ?? []) as TrustedContactRow[];

  if (contacts.length === 0) {
    return [];
  }

  const results: ProtectedPerson[] = [];

  for (const contact of contacts) {
    const { data: rawTrip } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', contact.user_id)
      .eq('trusted_contact_id', contact.id)
      .in('status', ['active', 'alert', 'alerted', 'timeout'])
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeTrip = rawTrip as TripRow | null;

    let activeAlert: AlertRow | null = null;
    if (activeTrip) {
      const { data: rawAlert } = await supabase
        .from('alerts')
        .select('*')
        .eq('trip_id', activeTrip.id)
        .is('resolved_at', null)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      activeAlert = rawAlert as AlertRow | null;
    }

    results.push({
      contactId: contact.id,
      name: contact.name,
      phone: contact.phone,
      userId: contact.user_id,
      activeTrip,
      activeAlert,
    });
  }

  return results;
}

/**
 * Fetches a specific alert with its trip and person info for the guardian view.
 */
export async function getGuardianAlertDetail(
  alertId: string,
): Promise<GuardianAlertDetail> {
  const { data: rawAlert, error: alertError } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', alertId)
    .single();

  const alert = rawAlert as AlertRow | null;

  if (alertError || !alert) {
    throw alertError ?? new Error('Alerte introuvable');
  }

  const { data: rawTrip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', alert.trip_id)
    .single();

  const trip = rawTrip as TripRow | null;

  if (tripError || !trip) {
    throw tripError ?? new Error('Trajet introuvable');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone')
    .eq('id', trip.user_id)
    .single();

  const { data: contact } = await supabase
    .from('trusted_contacts')
    .select('name, phone')
    .eq('id', trip.trusted_contact_id!)
    .single();

  const personName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(' ') || contact?.name || 'Inconnu';

  return {
    alert,
    trip,
    person: {
      name: personName,
      phone: profile?.phone ?? contact?.phone ?? '',
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
    },
  };
}

/**
 * Fetches trip detail for the guardian tracking view.
 */
export async function getGuardianTripDetail(tripId: string): Promise<{
  trip: TripRow;
  person: { name: string; phone: string };
  alert: AlertRow | null;
}> {
  const { data: rawTrip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  const trip = rawTrip as TripRow | null;

  if (tripError || !trip) {
    throw tripError ?? new Error('Trajet introuvable');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone')
    .eq('id', trip.user_id)
    .single();

  const { data: contact } = await supabase
    .from('trusted_contacts')
    .select('name, phone')
    .eq('id', trip.trusted_contact_id!)
    .single();

  const personName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(' ') || contact?.name || 'Inconnu';

  const { data: rawAlert } = await supabase
    .from('alerts')
    .select('*')
    .eq('trip_id', tripId)
    .is('resolved_at', null)
    .order('triggered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    trip,
    person: {
      name: personName,
      phone: profile?.phone ?? contact?.phone ?? '',
    },
    alert: rawAlert as AlertRow | null,
  };
}

/**
 * Acknowledge an alert as a guardian (marks it as acknowledged).
 */
export async function acknowledgeAlert(alertId: string): Promise<AlertRow> {
  const { data, error } = await supabase
    .from('alerts')
    .update({
      status: 'acknowledged' as const,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AlertRow;
}
