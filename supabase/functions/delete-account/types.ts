import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const DeleteAccountInputSchema = z.object({
  confirmation: z.literal("DELETE_MY_ACCOUNT"),
});

export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;

export interface DeleteAccountOutput {
  success: boolean;
}
