import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  NotifyContactsInputSchema,
  type AlertWithUser,
  type NotifyContactsOutput,
  type TrustedContact,
} from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildAlertMessage(
  alert: AlertWithUser,
  userName: string
): string {
  const typeLabels: Record<string, string> = {
    manual: "alerte manuelle",
    automatic: "alerte automatique",
    timeout: "non-confirmation d'arrivee",
  };

  let msg = `PRUDENCY ALERTE: ${userName} a declenche une ${typeLabels[alert.type] ?? "alerte"}.`;

  if (alert.reason) {
    msg += ` Raison: ${alert.reason}.`;
  }

  if (alert.triggered_lat != null && alert.triggered_lng != null) {
    msg += ` Position: https://maps.google.com/?q=${alert.triggered_lat},${alert.triggered_lng}`;
  }

  return msg;
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to read contacts across RLS boundaries
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a service-level call (from check-trip-timeout or other internal function)
    const isServiceCall = authHeader === `Bearer ${supabaseServiceKey}`;

    let userId: string | null = null;

    if (isServiceCall) {
      // Service-level call - userId will be extracted from the alert
      userId = null; // Will be set after fetching the alert
    } else {
      // User-level call - verify the caller is authenticated
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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
      userId = user.id;
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = NotifyContactsInputSchema.safeParse(body);
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

    const { alertId } = parseResult.data;

    // Fetch alert with user profile
    const { data: alert, error: alertError } = await supabaseAdmin
      .from("alerts")
      .select(
        `id, type, reason, triggered_lat, triggered_lng, battery_level,
         triggered_at, user_id, trip_id,
         profiles!alerts_user_id_fkey ( first_name, last_name, phone )`
      )
      .eq("id", alertId)
      .single();

    if (alertError || !alert) {
      return new Response(JSON.stringify({ error: "Alert not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alertData = alert as unknown as AlertWithUser;

    // For user-level calls, verify alert belongs to authenticated user
    // For service-level calls, skip this check (already authorized)
    if (userId !== null && alertData.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch trusted contacts for this user
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("trusted_contacts")
      .select("id, name, phone, notify_by_sms, notify_by_push")
      .eq("user_id", alertData.user_id);

    if (contactsError) {
      console.error("Fetch contacts error:", contactsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch contacts" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ notifiedCount: 0, failures: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userName = [
      alertData.profiles.first_name,
      alertData.profiles.last_name,
    ]
      .filter(Boolean)
      .join(" ") || "Un utilisateur Prudency";

    const message = buildAlertMessage(alertData, userName);

    const output: NotifyContactsOutput = {
      notifiedCount: 0,
      failures: [],
    };

    // Send SMS to each contact that has notify_by_sms enabled
    const smsPromises = (contacts as TrustedContact[])
      .filter((contact) => contact.notify_by_sms && contact.phone)
      .map(async (contact) => {
        try {
          const smsResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-sms`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: contact.phone,
                message,
              }),
            }
          );

          if (!smsResponse.ok) {
            const errorBody = await smsResponse.text();
            output.failures.push({
              contactId: contact.id,
              contactName: contact.name,
              method: "sms",
              error: `SMS failed: ${smsResponse.status} ${errorBody}`,
            });
            return;
          }

          output.notifiedCount++;
        } catch (err) {
          output.failures.push({
            contactId: contact.id,
            contactName: contact.name,
            method: "sms",
            error: `SMS error: ${err instanceof Error ? err.message : "Unknown"}`,
          });
        }
      });

    await Promise.all(smsPromises);

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-contacts error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
