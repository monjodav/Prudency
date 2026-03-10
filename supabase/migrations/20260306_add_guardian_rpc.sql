-- ============================================================
-- Migration: Add RPC to fetch people the current user protects
-- "Je protège" = contacts where my phone number appears in
-- another user's trusted_contacts list (and I accepted the invitation)
-- ============================================================

CREATE OR REPLACE FUNCTION get_people_i_protect()
RETURNS TABLE (
  id UUID,
  owner_user_id UUID,
  owner_first_name TEXT,
  owner_last_name TEXT,
  owner_phone TEXT,
  validation_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  -- Get the current user's phone number
  SELECT p.phone INTO v_phone
  FROM profiles p
  WHERE p.id = auth.uid();

  IF v_phone IS NULL THEN
    RETURN;
  END IF;

  -- Find trusted_contacts rows where my phone is listed by another user
  RETURN QUERY
  SELECT
    tc.id,
    tc.user_id AS owner_user_id,
    p.first_name AS owner_first_name,
    p.last_name AS owner_last_name,
    p.phone AS owner_phone,
    tc.validation_status,
    tc.created_at
  FROM trusted_contacts tc
  JOIN profiles p ON p.id = tc.user_id
  WHERE tc.phone = v_phone
    AND tc.user_id != auth.uid();
END;
$$;
