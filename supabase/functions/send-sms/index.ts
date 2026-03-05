import { SendSmsInputSchema, type SendSmsOutput } from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendSmsViaOvh, isOvhConfigured } from "../_shared/ovhSms.ts";
import { timingSafeEqual } from "../_shared/hashUtils.ts";

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
    // Internal-only: require X-Internal-Secret header
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

    const providedSecret = req.headers.get("X-Internal-Secret") ?? "";
    const isAuthorized = await timingSafeEqual(internalSecret, providedSecret);
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check OVH config
    if (!isOvhConfigured()) {
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = SendSmsInputSchema.safeParse(body);
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

    const { to, message } = parseResult.data;
    const result = await sendSmsViaOvh(to, message);

    const output: SendSmsOutput = {
      messageId: result.messageId,
      status: "sent",
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-sms error:", error instanceof Error ? error.message : "Unknown");

    const message = error instanceof Error ? error.message : "";
    if (message === "Invalid phone number") {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
