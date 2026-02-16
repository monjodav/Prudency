import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SendSmsInputSchema,
  type PlivoMessageResponse,
  type SendSmsOutput,
} from "./types.ts";

const PLIVO_AUTH_ID = Deno.env.get("PLIVO_AUTH_ID");
const PLIVO_AUTH_TOKEN = Deno.env.get("PLIVO_AUTH_TOKEN");
const PLIVO_SENDER_NUMBER = Deno.env.get("PLIVO_SENDER_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    // Verify JWT - extract user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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

    // Validate Plivo configuration
    if (!PLIVO_AUTH_ID || !PLIVO_AUTH_TOKEN || !PLIVO_SENDER_NUMBER) {
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
        }
      );
    }

    const { to, message } = parseResult.data;

    // Send SMS via Plivo REST API
    const plivoUrl = `https://api.plivo.com/v1/Account/${PLIVO_AUTH_ID}/Message/`;
    const credentials = btoa(`${PLIVO_AUTH_ID}:${PLIVO_AUTH_TOKEN}`);

    const plivoResponse = await fetch(plivoUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        src: PLIVO_SENDER_NUMBER,
        dst: to,
        text: message,
      }),
    });

    if (!plivoResponse.ok) {
      const errorBody = await plivoResponse.text();
      console.error("Plivo API error:", plivoResponse.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const plivoData: PlivoMessageResponse = await plivoResponse.json();

    const output: SendSmsOutput = {
      messageUuid: plivoData.message_uuid[0],
      status: "sent",
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
