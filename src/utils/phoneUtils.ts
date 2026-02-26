/**
 * Converts a French phone number to E.164 format.
 * "0651872510" → "+33651872510"
 * "+33651872510" → "+33651872510" (already E.164)
 * Strips spaces, dots, and dashes before conversion.
 */
export function toE164(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+33${cleaned.slice(1)}`;
  }

  throw new Error('Format de numéro invalide : conversion E.164 impossible');
}
