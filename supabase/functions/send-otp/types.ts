import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const SendOtpInputSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
});

export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

export interface SendOtpOutput {
  success: boolean;
  expiresIn: number;
}
