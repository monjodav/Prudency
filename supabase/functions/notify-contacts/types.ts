import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const NotifyContactsInputSchema = z.object({
  alertId: z.string().uuid(),
});

export type NotifyContactsInput = z.infer<typeof NotifyContactsInputSchema>;

export interface NotifyContactsOutput {
  notifiedCount: number;
  failures: Array<{
    contactId: string;
    contactName: string;
    method: "sms" | "push";
    error: string;
  }>;
}

export interface AlertWithUser {
  id: string;
  type: string;
  reason: string | null;
  triggered_lat: number | null;
  triggered_lng: number | null;
  battery_level: number | null;
  triggered_at: string;
  user_id: string;
  trip_id: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  notify_by_sms: boolean;
  notify_by_push: boolean;
}
