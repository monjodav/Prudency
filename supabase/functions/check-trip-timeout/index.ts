import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CheckTripTimeoutInputSchema,
  type CheckTripTimeoutOutput,
  TIMEOUT_BUFFER_MINUTES,
} from "./types.ts";

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
    // No JWT verification - this function is called by cron
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate input
    const body = await req.json();
    const parseResult = CheckTripTimeoutInputSchema.safeParse(body);
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

    const { tripId } = parseResult.data;

    // Fetch the trip
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, user_id, status, estimated_arrival_at")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trip already completed, cancelled, or alerted
    if (trip.status !== "active") {
      const output: CheckTripTimeoutOutput = {
        tripId: trip.id,
        status: trip.status,
        alertTriggered: false,
      };
      return new Response(JSON.stringify(output), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!trip.estimated_arrival_at) {
      const output: CheckTripTimeoutOutput = {
        tripId: trip.id,
        status: trip.status,
        alertTriggered: false,
      };
      return new Response(JSON.stringify(output), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if trip has exceeded estimated arrival + buffer
    const estimatedArrival = new Date(trip.estimated_arrival_at);
    const deadline = new Date(
      estimatedArrival.getTime() + TIMEOUT_BUFFER_MINUTES * 60 * 1000
    );
    const now = new Date();

    if (now <= deadline) {
      // Not timed out yet
      const output: CheckTripTimeoutOutput = {
        tripId: trip.id,
        status: trip.status,
        alertTriggered: false,
      };
      return new Response(JSON.stringify(output), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trip has timed out - get last known location
    const { data: lastLocation } = await supabase
      .from("trip_locations")
      .select("lat, lng, battery_level")
      .eq("trip_id", tripId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Create timeout alert
    const { data: alert, error: alertError } = await supabase
      .from("alerts")
      .insert({
        trip_id: tripId,
        user_id: trip.user_id,
        type: "timeout",
        reason: `Trajet non confirme apres ${TIMEOUT_BUFFER_MINUTES} min de delai`,
        triggered_lat: lastLocation?.lat ?? null,
        triggered_lng: lastLocation?.lng ?? null,
        battery_level: lastLocation?.battery_level ?? null,
      })
      .select("id")
      .single();

    if (alertError || !alert) {
      console.error("Create alert error:", alertError);
      return new Response(
        JSON.stringify({ error: "Failed to create alert" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update trip status to timeout
    const { error: updateError } = await supabase
      .from("trips")
      .update({ status: "timeout" })
      .eq("id", tripId);

    if (updateError) {
      console.error("Update trip status error:", updateError);
    }

    // Notify contacts via internal call (using service role key for auth)
    try {
      const notifyResponse = await fetch(
        `${supabaseUrl}/functions/v1/notify-contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alertId: alert.id }),
        }
      );

      if (!notifyResponse.ok) {
        const errorBody = await notifyResponse.text();
        console.error("Notify contacts failed:", errorBody);
      }
    } catch (notifyErr) {
      console.error("Notify contacts error:", notifyErr);
    }

    const output: CheckTripTimeoutOutput = {
      tripId: trip.id,
      status: "timeout",
      alertTriggered: true,
      alertId: alert.id,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-trip-timeout error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
