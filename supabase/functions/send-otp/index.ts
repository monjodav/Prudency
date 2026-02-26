import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SendOtpInputSchema, type SendOtpOutput } from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendSmsViaOvh, isOvhConfigured } from "../_shared/ovhSms.ts";
import { sha256 } from "../_shared/hashUtils.ts";

const OTP_EXPIRY_SECONDS = 600;
const MAX_SENDS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_SECONDS = 600;

function generateOtpCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("send-otp auth failed:", authError?.message ?? "no user", "header:", authHeader?.substring(0, 20));
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check OVH config
    const ovhReady = isOvhConfigured();
    console.log("OVH configured:", ovhReady);
    if (!ovhReady) {
      console.error("Missing OVH env vars — check project secrets");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate input
    const body = await req.json();
    const parseResult = SendOtpInputSchema.safeParse(body);
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

    const { phone } = parseResult.data;

    // Use service_role client for DB operations on phone_verifications
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit: max 3 sends per 10 min per user
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000,
    ).toISOString();

    const { count, error: countError } = await adminClient
      .from("phone_verifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("phone", phone)
      .gte("created_at", windowStart);

    if (countError) {
      console.error("Rate limit check error:", countError.message);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
      return new Response(
        JSON.stringify({ error: "too_many_requests" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate OTP
    const code = generateOtpCode();
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_SECONDS * 1000,
    ).toISOString();

    // Send SMS first — only persist if delivery succeeds
    await sendSmsViaOvh(
      phone,
      `${code} est ton code de verification Prudency. Ne le partage avec personne.`,
    );

    // Hash code before storage
    const hashedCode = await sha256(code);

    // Store in DB
    const { error: insertError } = await adminClient
      .from("phone_verifications")
      .insert({
        user_id: user.id,
        phone,
        code: hashedCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("OTP insert error:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const output: SendOtpOutput = {
      success: true,
      expiresIn: OTP_EXPIRY_SECONDS,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "send-otp error:",
      error instanceof Error ? error.message : "Unknown",
    );

    const message = error instanceof Error ? error.message : "";
    if (message === "Invalid phone number") {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
