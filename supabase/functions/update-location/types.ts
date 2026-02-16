import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const UpdateLocationInputSchema = z.object({
  tripId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
});

export type UpdateLocationInput = z.infer<typeof UpdateLocationInputSchema>;

export interface UpdateLocationOutput {
  success: boolean;
  locationId: string;
}
