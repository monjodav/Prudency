import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  NotifyTripStartedInputSchema,
  type NotifyTripStartedOutput,
} from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/retry.ts";
import {
  getActiveTokensForUsers,
  sendPushNotifications,
} from "../_shared/pushNotification.ts";

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
    const parseResult = NotifyTripStartedInputSchema.safeParse(body);
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

    // Verify trip belongs to user
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .select(
        `id, user_id, arrival_address,
         profiles!trips_user_id_fkey ( first_name, last_name )`,
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

    const profile = trip.profiles as unknown as {
      first_name: string | null;
      last_name: string | null;
    };

    const userName =
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Un(e) utilisateur(rice) Prudency";

    const destination = trip.arrival_address || "une destination";
    const message = `Prudency: ${userName} a démarré un trajet vers ${destination}.`;

    // Fetch trusted contacts
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("trusted_contacts")
      .select("id, name, phone, notify_by_sms, notify_by_push")
      .eq("user_id", user.id);

    if (contactsError || !contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ tripId, notifiedCount: 0, failures: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const output: NotifyTripStartedOutput = {
      tripId,
      notifiedCount: 0,
      failures: [],
    };

    // Send SMS to contacts with notify_by_sms
    const smsContacts = contacts.filter(
      (c: { notify_by_sms: boolean | null; phone: string | null }) =>
        c.notify_by_sms && c.phone,
    );

    const smsPromises = smsContacts.map(
      async (contact: { id: string; phone: string }) => {
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
              body: JSON.stringify({ to: contact.phone, message }),
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

    // Push notifications to contacts who are Prudency users
    const pushContacts = contacts.filter(
      (c: { notify_by_push: boolean | null; phone: string | null }) =>
        c.notify_by_push && c.phone,
    );

    if (pushContacts.length > 0 && internalSecret) {
      const contactPhones = pushContacts.map(
        (c: { phone: string }) => c.phone,
      );
      const { data: matchedProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, phone")
        .in("phone", contactPhones);

      if (matchedProfiles && matchedProfiles.length > 0) {
        const matchedUserIds = matchedProfiles.map(
          (p: { id: string }) => p.id,
        );
        const tokenMap = await getActiveTokensForUsers(
          supabaseAdmin,
          matchedUserIds,
        );
        const allTokens = Array.from(tokenMap.values()).flat();

        if (allTokens.length > 0) {
          const pushResult = await sendPushNotifications({
            supabaseUrl,
            internalSecret,
            tokens: allTokens,
            title: "Trajet démarré",
            body: message,
            data: { type: "contact_trip_started", tripId },
            sound: "default",
          });

          output.notifiedCount += pushResult.sent;
        }
      }
    }

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      "notify-trip-started error:",
      error instanceof Error ? error.message : "Unknown",
    );
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
