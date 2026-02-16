import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const CheckTripTimeoutInputSchema = z.object({
  tripId: z.string().uuid(),
});

export type CheckTripTimeoutInput = z.infer<typeof CheckTripTimeoutInputSchema>;

export interface CheckTripTimeoutOutput {
  tripId: string;
  status: string;
  alertTriggered: boolean;
  alertId?: string;
}

/** Buffer in minutes after estimated arrival before triggering timeout alert */
export const TIMEOUT_BUFFER_MINUTES = 5;
