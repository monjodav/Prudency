import { Database } from './database';

export type TrustedContactRow = Database['public']['Tables']['trusted_contacts']['Row'];
export type TrustedContactInsert = Database['public']['Tables']['trusted_contacts']['Insert'];
export type TrustedContactUpdate = Database['public']['Tables']['trusted_contacts']['Update'];

export interface ContactCreateInput {
  name: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
  notifyByPush?: boolean;
  notifyBySms?: boolean;
}

export interface ContactUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  notifyByPush?: boolean;
  notifyBySms?: boolean;
}
