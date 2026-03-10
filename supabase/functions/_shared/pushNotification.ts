import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchWithRetry } from "./retry.ts";

interface PushToken {
  user_id: string;
  token: string;
}

export async function getActiveTokensForUsers(
  adminClient: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string[]>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await adminClient
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", userIds)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch push tokens:", error.message);
    return new Map();
  }

  const tokenMap = new Map<string, string[]>();
  for (const row of (data ?? []) as PushToken[]) {
    const existing = tokenMap.get(row.user_id) ?? [];
    existing.push(row.token);
    tokenMap.set(row.user_id, existing);
  }

  return tokenMap;
}

interface SendPushParams {
  supabaseUrl: string;
  internalSecret: string;
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | "critical";
  priority?: "default" | "high";
}

export async function sendPushNotifications(
  params: SendPushParams,
): Promise<{ sent: number; failed: number; invalidTokens: string[] }> {
  const { supabaseUrl, internalSecret, tokens, title, body, data, sound, priority } = params;

  if (tokens.length === 0) {
    return { sent: 0, failed: 0, invalidTokens: [] };
  }

  try {
    const response = await fetchWithRetry(
      `${supabaseUrl}/functions/v1/send-push-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": internalSecret,
        },
        body: JSON.stringify({
          tokens,
          title,
          body,
          data: data ?? {},
          sound: sound ?? "default",
          priority: priority ?? "default",
        }),
      },
    );

    if (!response.ok) {
      console.error("send-push-notification failed:", response.status);
      return { sent: 0, failed: tokens.length, invalidTokens: [] };
    }

    return await response.json();
  } catch (err) {
    console.error("Push notification error:", err instanceof Error ? err.message : "Unknown");
    return { sent: 0, failed: tokens.length, invalidTokens: [] };
  }
}
