import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SendContactInvitationInputSchema,
  type SendContactInvitationOutput,
  MAX_INVITATIONS_PER_CONTACT,
  INVITATION_DELAYS_MS,
} from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateInvitationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    // Parse and validate input
    const body = await req.json();
    const parseResult = SendContactInvitationInputSchema.safeParse(body);
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

    const { contactId, recipientPhone, recipientName } = parseResult.data;

    // Use service role to update the contact (bypass RLS for write)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the contact to check ownership and invitation count
    const { data: contact, error: contactError } = await supabaseAdmin
      .from("trusted_contacts")
      .select(
        "id, user_id, invitation_count, invitation_sent_at, invitation_token",
      )
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      return new Response(JSON.stringify({ error: "Contact not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (contact.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: max 3 SMS per contact with increasing delays
    const currentCount = contact.invitation_count ?? 0;
    if (currentCount >= MAX_INVITATIONS_PER_CONTACT) {
      return new Response(
        JSON.stringify({
          error: "Nombre maximum d'invitations atteint pour ce contact",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check delay between invitations
    if (currentCount > 0 && contact.invitation_sent_at) {
      const lastSentAt = new Date(contact.invitation_sent_at).getTime();
      const requiredDelay = INVITATION_DELAYS_MS[currentCount] ?? 0;
      const elapsed = Date.now() - lastSentAt;

      if (elapsed < requiredDelay) {
        const remainingSeconds = Math.ceil(
          (requiredDelay - elapsed) / 1000,
        );
        return new Response(
          JSON.stringify({
            error: `Veuillez attendre encore ${remainingSeconds} secondes avant de renvoyer une invitation`,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Generate invitation token (reuse existing if present)
    const invitationToken = contact.invitation_token ?? generateInvitationToken();

    // Fetch sender's profile name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const senderName = [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") || "Un utilisateur";

    // Construct invitation message in French
    const appLink = "https://prudency.app/accept-contact";
    const message =
      `Bonjour ${recipientName}, ${senderName} souhaite t'ajouter comme personne de confiance sur Prudency. Accepte la demande ici : ${appLink}?token=${invitationToken}`;

    // Update the contact record with invitation info
    const { error: updateError } = await supabaseAdmin
      .from("trusted_contacts")
      .update({
        invitation_token: invitationToken,
        invitation_sent_at: new Date().toISOString(),
        invitation_count: currentCount + 1,
      })
      .eq("id", contactId);

    if (updateError) {
      console.error("Update contact error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update contact" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Send SMS via the send-sms Edge Function
    const smsResponse = await fetch(
      `${supabaseUrl}/functions/v1/send-sms`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipientPhone,
          message,
        }),
      },
    );

    if (!smsResponse.ok) {
      const errorBody = await smsResponse.text();
      console.error("SMS send failed:", smsResponse.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send invitation SMS" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const output: SendContactInvitationOutput = {
      invitationToken,
      status: "sent",
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-contact-invitation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
