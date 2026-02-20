import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const SendContactInvitationInputSchema = z.object({
  contactId: z.string().uuid(),
  recipientPhone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
  recipientName: z.string().min(1).max(100),
});

export type SendContactInvitationInput = z.infer<
  typeof SendContactInvitationInputSchema
>;

export interface SendContactInvitationOutput {
  invitationToken: string;
  status: string;
}

export const MAX_INVITATIONS_PER_CONTACT = 3;

export const INVITATION_DELAYS_MS = [
  0,
  2 * 60 * 1000,
  60 * 60 * 1000,
] as const;
