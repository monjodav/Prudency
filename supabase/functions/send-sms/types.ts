import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const SendSmsInputSchema = z.object({
  to: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format"),
  message: z.string().min(1).max(1600),
});

export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

export interface SendSmsOutput {
  messageUuid: string;
  status: string;
}

export interface PlivoMessageResponse {
  message: string;
  message_uuid: string[];
  api_id: string;
}

export interface PlivoErrorResponse {
  error: string;
  api_id?: string;
}
