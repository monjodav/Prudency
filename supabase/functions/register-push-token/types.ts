import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const RegisterPushTokenInputSchema = z.object({
  token: z.string().min(1, "Token is required"),
  platform: z.enum(["ios", "android"]),
});

export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenInputSchema>;

export interface RegisterPushTokenOutput {
  success: boolean;
}
