import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const AlertTypeSchema = z.enum(["manual", "automatic", "timeout"]);

export const SendAlertInputSchema = z.object({
  tripId: z.string().uuid().optional(),
  type: AlertTypeSchema,
  reason: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});

export type SendAlertInput = z.infer<typeof SendAlertInputSchema>;

export interface NotifiedContact {
  contactId: string;
  contactName: string;
}

export interface SendAlertOutput {
  alertId: string;
  notifiedContacts: NotifiedContact[];
  timestamp: string;
}
