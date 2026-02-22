import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  UpdateLocationInputSchema,
  type UpdateLocationOutput,
} from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";

const LOCATION_RATE_LIMIT_MS = 5_000; // 1 update per 5 seconds per trip

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

    // Parse and validate input
    const body = await req.json();
    const parseResult = UpdateLocationInputSchema.safeParse(body);
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

    const { tripId, lat, lng, accuracy, speed, heading, batteryLevel } =
      parseResult.data;

    // Rate limit: max 1 location update per 5 seconds per trip
    const rateLimitKey = `location:${tripId}`;
    const rateCheck = checkRateLimit(rateLimitKey, LOCATION_RATE_LIMIT_MS);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many location updates" }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    // Verify trip belongs to user and is active
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, status, user_id")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (trip.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (trip.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Trip is not active" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert location record
    const { data: location, error: insertError } = await supabase
      .from("trip_locations")
      .insert({
        trip_id: tripId,
        lat,
        lng,
        accuracy: accuracy ?? null,
        speed: speed ?? null,
        heading: heading ?? null,
        battery_level: batteryLevel ?? null,
      })
      .select("id")
      .single();

    if (insertError || !location) {
      console.error("Insert location error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save location" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const output: UpdateLocationOutput = {
      success: true,
      locationId: location.id,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("update-location error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
