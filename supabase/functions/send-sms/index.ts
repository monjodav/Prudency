import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SendSmsInputSchema,
  type OvhSmsResponse,
  type SendSmsOutput,
} from "./types.ts";

const OVH_APPLICATION_KEY = Deno.env.get("OVH_APPLICATION_KEY");
const OVH_APPLICATION_SECRET = Deno.env.get("OVH_APPLICATION_SECRET");
const OVH_CONSUMER_KEY = Deno.env.get("OVH_CONSUMER_KEY");
const OVH_SMS_SERVICE_NAME = Deno.env.get("OVH_SMS_SERVICE_NAME");
const OVH_SMS_SENDER = Deno.env.get("OVH_SMS_SENDER") ?? "Prudency";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function computeOvhSignature(
  applicationSecret: string,
  consumerKey: string,
  method: string,
  url: string,
  body: string,
  timestamp: number,
): Promise<string> {
  const toSign = `${applicationSecret}+${consumerKey}+${method}+${url}+${body}+${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `$1$${hashHex}`;
}

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Allow both user-level and service-level calls
    const isServiceCall = authHeader === `Bearer ${supabaseServiceKey}`;

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

    // Validate OVH configuration
    if (
      !OVH_APPLICATION_KEY ||
      !OVH_APPLICATION_SECRET ||
      !OVH_CONSUMER_KEY ||
      !OVH_SMS_SERVICE_NAME
    ) {
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

    // Build OVH SMS API request
    const ovhUrl = `https://eu.api.ovh.com/1.0/sms/${OVH_SMS_SERVICE_NAME}/jobs`;
    const ovhBody = JSON.stringify({
      charset: "UTF-8",
      coding: "7bit",
      message,
      noStopClause: true,
      priority: "high",
      receivers: [to],
      sender: OVH_SMS_SENDER,
      validityPeriod: 2880,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await computeOvhSignature(
      OVH_APPLICATION_SECRET,
      OVH_CONSUMER_KEY,
      "POST",
      ovhUrl,
      ovhBody,
      timestamp,
    );

    const ovhResponse = await fetch(ovhUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": OVH_APPLICATION_KEY,
        "X-Ovh-Timestamp": String(timestamp),
        "X-Ovh-Signature": signature,
        "X-Ovh-Consumer": OVH_CONSUMER_KEY,
      },
      body: ovhBody,
    });

    if (!ovhResponse.ok) {
      const errorBody = await ovhResponse.text();
      console.error("OVH SMS API error:", ovhResponse.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ovhData: OvhSmsResponse = await ovhResponse.json();

    if (ovhData.invalidReceivers.length > 0) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const output: SendSmsOutput = {
      messageId: String(ovhData.ids[0]),
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
      },
    );
  }
});
