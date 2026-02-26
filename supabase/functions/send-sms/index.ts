import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SendSmsInputSchema, type SendSmsOutput } from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendSmsViaOvh, isOvhConfigured } from "../_shared/ovhSms.ts";

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
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Allow both user-level and service-level calls
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const isServiceCall = !!(internalSecret && req.headers.get("X-Internal-Secret") === internalSecret);

    if (!isServiceCall) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
