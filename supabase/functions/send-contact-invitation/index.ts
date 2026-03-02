import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  SendContactInvitationInputSchema,
  type SendContactInvitationOutput,
  MAX_INVITATIONS_PER_CONTACT,
  INVITATION_DELAYS_MS,
} from "./types.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendSmsViaOvh, isOvhConfigured } from "../_shared/ovhSms.ts";

function generateInvitationToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    // Construct invitation message in French (GSM 7bit, ≤160 chars = 1 SMS credit)
    const message =
      `Bonjour, ${senderName} vous a choisi(e) comme contact de confiance sur Prudency. Téléchargez l'app pour accepter.`;

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

    // Send SMS directly via OVH (recipient is not a Prudency user yet)
    if (!isOvhConfigured()) {
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await sendSmsViaOvh(recipientPhone, message);

    const output: SendContactInvitationOutput = {
      invitationToken,
      status: "sent",
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-contact-invitation error:", error instanceof Error ? error.message : "Unknown");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
