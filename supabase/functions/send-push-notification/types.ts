import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const SendPushInputSchema = z.object({
  tokens: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.unknown()).optional().default({}),
  sound: z.enum(["default", "critical"]).optional().default("default"),
  priority: z.enum(["default", "high"]).optional().default("default"),
});

export type SendPushInput = z.infer<typeof SendPushInputSchema>;

export interface SendPushOutput {
  sent: number;
  failed: number;
  invalidTokens: string[];
}
