import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SendAlertInputSchema,
  type NotifiedContact,
  type SendAlertOutput,
} from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

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

    // Rate limiting: max 10 alerts per user per 60 seconds
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recentAlertCount } = await supabaseAdmin
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("triggered_at", sixtySecondsAgo);

    if ((recentAlertCount ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "Too many alerts. Please wait before trying again." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = SendAlertInputSchema.safeParse(body);
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

    const { tripId, type, reason, lat, lng, batteryLevel } = parseResult.data;

    // If tripId provided, verify it belongs to the user and is active
    if (tripId) {
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
    }

    // Create alert record
    const { data: alert, error: alertError } = await supabase
      .from("alerts")
      .insert({
        trip_id: tripId ?? null,
        user_id: user.id,
        type,
        reason: reason ?? null,
        triggered_lat: lat ?? null,
        triggered_lng: lng ?? null,
        battery_level: batteryLevel ?? null,
      })
      .select("id, triggered_at")
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

    // Update trip status to 'alerted' if tripId provided
    if (tripId) {
      const { error: updateError } = await supabase
        .from("trips")
        .update({ status: "alerted" })
        .eq("id", tripId);

      if (updateError) {
        console.error("Update trip status error:", updateError);
      }
    }

    // Notify contacts via notify-contacts function
    const notifiedContacts: NotifiedContact[] = [];

    try {
      const notifyResponse = await fetchWithRetry(
        `${supabaseUrl}/functions/v1/notify-contacts`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alertId: alert.id }),
        },
      );

      if (notifyResponse.ok) {
        // Fetch the contacts that were notified for the response
        const { data: contacts } = await supabaseAdmin
          .from("trusted_contacts")
          .select("id, name")
          .eq("user_id", user.id);

        if (contacts) {
          for (const contact of contacts) {
            notifiedContacts.push({
              contactId: contact.id,
              contactName: contact.name,
            });
          }
        }
      } else {
        console.error("Notify contacts failed: status", notifyResponse.status);
      }
    } catch (notifyErr) {
      console.error("Notify contacts error:", notifyErr);
    }

    const output: SendAlertOutput = {
      alertId: alert.id,
      notifiedContacts,
      timestamp: alert.triggered_at,
    };

    return new Response(JSON.stringify(output), {
      status: 201,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Window": "60",
        "X-RateLimit-Remaining": String(Math.max(0, 10 - ((recentAlertCount ?? 0) + 1))),
      },
    });
  } catch (error) {
    console.error("send-alert error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
