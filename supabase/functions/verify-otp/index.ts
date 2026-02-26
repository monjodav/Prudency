import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { VerifyOtpInputSchema, type VerifyOtpOutput } from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sha256, timingSafeEqual } from "../_shared/hashUtils.ts";

const MAX_ATTEMPTS = 5;

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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input
    const body = await req.json();
    const parseResult = VerifyOtpInputSchema.safeParse(body);
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

    const { phone, code } = parseResult.data;

    // Use service_role client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Find the latest non-expired, non-verified OTP for this user + phone
    const now = new Date().toISOString();
    const { data: otpRecord, error: fetchError } = await adminClient
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("phone", phone)
      .is("verified_at", null)
      .gte("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("OTP fetch error:", fetchError.message);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: "code_expired" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "too_many_attempts" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Increment attempts
    await adminClient
      .from("phone_verifications")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    // Verify code (constant-time comparison on hashed values)
    const hashedInput = await sha256(code);
    if (!timingSafeEqual(otpRecord.code, hashedInput)) {
      const output: VerifyOtpOutput = { verified: false };
      return new Response(JSON.stringify(output), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Code matches — mark as verified
    await adminClient
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // Update profile: phone_verified = true
    await adminClient
      .from("profiles")
      .update({
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    const output: VerifyOtpOutput = { verified: true };
    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "verify-otp error:",
      error instanceof Error ? error.message : "Unknown",
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
