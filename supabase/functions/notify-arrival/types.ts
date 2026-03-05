import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const NotifyArrivalInputSchema = z.object({
  tripId: z.string().uuid(),
});

export type NotifyArrivalInput = z.infer<typeof NotifyArrivalInputSchema>;

export interface NotifyArrivalOutput {
  tripId: string;
  notifiedCount: number;
  failures: Array<{
    contactId: string;
    error: string;
  }>;
}
