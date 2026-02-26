-- Phone OTP verification codes table
CREATE TABLE phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int DEFAULT 0,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookup by user + phone (most recent first)
CREATE INDEX idx_phone_verifications_user_phone
  ON phone_verifications (user_id, phone, created_at DESC);

-- RLS enabled with no policies = deny all for anon/authenticated.
-- Only service_role (Edge Functions) can access. OTP codes must never be readable by end users.
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE phone_verifications IS
  'OTP verification codes. Accessible only via service_role (Edge Functions). No RLS policies = deny all for anon/authenticated.';
