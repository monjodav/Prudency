import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  NotifyArrivalInputSchema,
  type NotifyArrivalOutput,
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
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const parseResult = NotifyArrivalInputSchema.safeParse(body);
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

    const { tripId } = parseResult.data;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .select(
        `id, user_id, status, trusted_contact_id, arrival_address, arrival_notified,
         profiles!trips_user_id_fkey ( first_name, last_name )`
      )
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (trip.status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Trip is not completed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Rate limit: max 1 arrival notification per trip
    if (trip.arrival_notified) {
      return new Response(
        JSON.stringify({ error: "Arrival notification already sent for this trip" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("trusted_contacts")
      .select("id, name, phone, notify_by_sms")
      .eq("user_id", user.id);

    if (contactsError) {
      console.error("Fetch contacts error:", contactsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch contacts" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!contacts || contacts.length === 0) {
      const output: NotifyArrivalOutput = {
        tripId,
        notifiedCount: 0,
        failures: [],
      };
      return new Response(JSON.stringify(output), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = trip.profiles as unknown as {
      first_name: string | null;
      last_name: string | null;
    };

    const userName =
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Un utilisateur Prudency";

    const destination = trip.arrival_address || "sa destination";
    const message = `Prudency: ${userName} est bien arrivee a ${destination}. Tout va bien.`;

    const output: NotifyArrivalOutput = {
      tripId,
      notifiedCount: 0,
      failures: [],
    };

    const smsPromises = contacts
      .filter(
        (c: { notify_by_sms: boolean | null; phone: string | null }) =>
          c.notify_by_sms && c.phone,
      )
      .map(
        async (contact: {
          id: string;
          phone: string;
          notify_by_sms: boolean | null;
        }) => {
          try {
            const smsResponse = await fetchWithRetry(
              `${supabaseUrl}/functions/v1/send-sms`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(internalSecret
                    ? { "X-Internal-Secret": internalSecret }
                    : {}),
                },
                body: JSON.stringify({
                  to: contact.phone,
                  message,
                }),
              },
            );

            if (!smsResponse.ok) {
              output.failures.push({
                contactId: contact.id,
                error: `SMS failed: status ${smsResponse.status}`,
              });
              return;
            }

            output.notifiedCount++;
          } catch (err) {
            output.failures.push({
              contactId: contact.id,
              error: `SMS error: ${err instanceof Error ? err.message : "Unknown"}`,
            });
          }
        },
      );

    await Promise.all(smsPromises);

    // Mark trip as notified to prevent duplicate notifications
    await supabaseAdmin
      .from("trips")
      .update({ arrival_notified: true })
      .eq("id", tripId);

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "notify-arrival error:",
      error instanceof Error ? error.message : "Unknown",
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
