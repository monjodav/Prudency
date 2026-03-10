import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SendPushInputSchema, type SendPushOutput } from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { timingSafeEqual } from "../_shared/hashUtils.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: "DeviceNotRegistered" | "InvalidCredentials" | "MessageTooBig" | "MessageRateExceeded";
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Internal-only: require X-Internal-Secret
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    if (!internalSecret) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const isServiceCall = await timingSafeEqual(
      internalSecret,
      req.headers.get("X-Internal-Secret") ?? "",
    );
    if (!isServiceCall) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const parseResult = SendPushInputSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: parseResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { tokens, title, body: messageBody, data, sound, priority } = parseResult.data;

    // Build Expo push messages
    const messages = tokens.map((token) => ({
      to: token,
      title,
      body: messageBody,
      data,
      sound,
      priority,
      channelId: sound === "critical" ? "alerts" : "default",
    }));

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      console.error("Expo Push API error:", response.status);
      return new Response(
        JSON.stringify({ error: "Push service error", status: response.status }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await response.json();
    const tickets: ExpoPushTicket[] = result.data ?? [];

    const invalidTokens: string[] = [];
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === "ok") {
        sent++;
      } else {
        failed++;
        if (ticket.details?.error === "DeviceNotRegistered") {
          invalidTokens.push(tokens[i]);
        }
      }
    }

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      const { error: deactivateError } = await adminClient
        .from("push_tokens")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("token", invalidTokens);

      if (deactivateError) {
        console.error("Failed to deactivate tokens:", deactivateError.message);
      }
    }

    const output: SendPushOutput = { sent, failed, invalidTokens };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "send-push-notification error:",
      error instanceof Error ? error.message : "Unknown",
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
