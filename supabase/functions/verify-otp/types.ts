import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const VerifyOtpInputSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

export interface VerifyOtpOutput {
  verified: boolean;
}
