import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const NotifyTripStartedInputSchema = z.object({
  tripId: z.string().uuid(),
});

export type NotifyTripStartedInput = z.infer<typeof NotifyTripStartedInputSchema>;

export interface NotifyTripStartedOutput {
  tripId: string;
  notifiedCount: number;
  failures: Array<{
    contactId: string;
    error: string;
  }>;
}
