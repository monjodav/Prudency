import { Database } from './database';

export type TrustedContactRow = Database['public']['Tables']['trusted_contacts']['Row'];
export type TrustedContactInsert = Database['public']['Tables']['trusted_contacts']['Insert'];
export type TrustedContactUpdate = Database['public']['Tables']['trusted_contacts']['Update'];

export type ValidationStatus = 'pending' | 'accepted' | 'refused';

export interface ContactCreateInput {
  name: string;
  phone: string;
  isPrimary?: boolean;
  avatarUri?: string;
}

export interface ContactUpdateInput {
  name?: string;
  phone?: string;
  isPrimary?: boolean;
  isFavorite?: boolean;
}

export interface GuardianContact {
  id: string;
  ownerUserId: string;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  ownerPhone: string | null;
  validationStatus: ValidationStatus;
  createdAt: string;
}

