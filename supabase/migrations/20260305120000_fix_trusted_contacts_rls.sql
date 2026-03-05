-- ============================================================
-- Migration: Fix trusted_contacts RLS policies + secure invitation flow
-- Fixes CRITICAL security issues:
--   1. Overly permissive anon SELECT/UPDATE policies on trusted_contacts
--   2. Missing search_path on SECURITY DEFINER functions
-- ============================================================

-- ============================================
-- 1. Drop overly permissive RLS policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view contact by invitation token" ON trusted_contacts;
DROP POLICY IF EXISTS "Anyone can respond to invitation by token" ON trusted_contacts;

-- ============================================
-- 2. Create secure RPC for invitation responses
--    Anon users call this with the token from their SMS link.
--    No permissive RLS policies needed.
-- ============================================
CREATE OR REPLACE FUNCTION respond_to_invitation(
  p_token TEXT,
  p_response TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact RECORD;
BEGIN
  -- Validate response value
  IF p_response NOT IN ('accepted', 'refused') THEN
    RETURN jsonb_build_object('error', 'Invalid response value');
  END IF;

  -- Find contact by exact token match
  SELECT id, name, user_id, validation_status, invitation_token
  INTO v_contact
  FROM trusted_contacts
  WHERE invitation_token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid or expired invitation');
  END IF;

  IF v_contact.validation_status != 'pending' THEN
    RETURN jsonb_build_object('error', 'Invitation already responded to');
  END IF;

  -- Update the contact
  UPDATE trusted_contacts
  SET validation_status = p_response,
      invitation_token = NULL,
      updated_at = NOW()
  WHERE id = v_contact.id;

  RETURN jsonb_build_object(
    'success', true,
    'contactName', v_contact.name
  );
END;
$$;

-- ============================================
-- 3. Set search_path on all SECURITY DEFINER functions
--    Prevents search_path hijack attacks
-- ============================================
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION update_updated_at() SET search_path = public;
ALTER FUNCTION check_max_contacts() SET search_path = public;
ALTER FUNCTION check_max_trip_notes() SET search_path = public;
