-- Add arrival_notified flag to trips table for notify-arrival rate limiting
ALTER TABLE trips ADD COLUMN IF NOT EXISTS arrival_notified boolean NOT NULL DEFAULT false;

-- Create rate_limits table for DB-backed rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_created
  ON rate_limits (user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role should access rate_limits (Edge Functions use service_role key)
-- No user-facing policies needed

-- Auto-cleanup: delete rate_limit entries older than 1 hour
-- This keeps the table small; a pg_cron job or application-level cleanup can call this
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM rate_limits WHERE created_at < now() - interval '1 hour';
$$;
