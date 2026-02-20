-- ============================================================
-- Migration: align live DB schema with database.ts and services
-- Applied via MCP on 2026-02-17
-- ============================================================

-- ============================================
-- 1. PROFILES: add missing columns
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index on email (was in local migration but missing from live)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update handle_new_user to also populate email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$function$;

-- ============================================
-- 2. TRIPS: add missing columns
-- ============================================
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS departure_address TEXT,
  ADD COLUMN IF NOT EXISTS departure_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS departure_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS arrival_address TEXT,
  ADD COLUMN IF NOT EXISTS arrival_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS arrival_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS estimated_arrival_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Copy existing data from old columns to new columns
UPDATE public.trips SET
  departure_address = COALESCE(departure_address, origin_address),
  departure_lat = COALESCE(departure_lat, origin_latitude),
  departure_lng = COALESCE(departure_lng, origin_longitude),
  arrival_address = COALESCE(arrival_address, destination_address),
  arrival_lat = COALESCE(arrival_lat, destination_latitude),
  arrival_lng = COALESCE(arrival_lng, destination_longitude),
  estimated_arrival_at = COALESCE(estimated_arrival_at, estimated_arrival),
  completed_at = COALESCE(completed_at, actual_arrival);

-- Update status CHECK constraint to match database.ts values
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_status_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check
  CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text, 'timeout'::text, 'alerted'::text, 'alert'::text, 'scheduled'::text]));

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_trips_active ON public.trips(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_trips_estimated_arrival ON public.trips(estimated_arrival_at) WHERE status = 'active';

-- ============================================
-- 3. ALERTS: add missing columns
-- ============================================
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS triggered_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS triggered_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS battery_level INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Copy data from alert_type to type
UPDATE public.alerts SET type = alert_type WHERE type IS NULL AND alert_type IS NOT NULL;

-- Update alert_type CHECK to include 'automatic'
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE public.alerts ADD CONSTRAINT alerts_alert_type_check
  CHECK (alert_type = ANY (ARRAY['manual'::text, 'automatic'::text, 'timeout'::text, 'inactivity'::text, 'deviation'::text]));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON public.alerts(triggered_at DESC);

-- ============================================
-- 4. TRUSTED_CONTACTS: add missing columns
-- ============================================
ALTER TABLE public.trusted_contacts
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS notify_by_push BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_by_sms BOOLEAN DEFAULT TRUE;

-- Add partial index for primary contacts
CREATE INDEX IF NOT EXISTS idx_contacts_primary ON public.trusted_contacts(user_id, is_primary) WHERE is_primary = TRUE;

-- Add max contacts trigger
CREATE OR REPLACE FUNCTION public.check_max_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trusted_contacts WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 contacts de confiance autorises';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_contacts ON public.trusted_contacts;
CREATE TRIGGER enforce_max_contacts
  BEFORE INSERT ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION check_max_contacts();

-- ============================================
-- 5. TRIP_NOTES: add missing columns
-- ============================================
ALTER TABLE public.trip_notes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Add composite index
CREATE INDEX IF NOT EXISTS idx_trip_notes_created_at ON public.trip_notes(trip_id, created_at DESC);

-- Add max notes trigger
CREATE OR REPLACE FUNCTION public.check_max_trip_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trip_notes WHERE trip_id = NEW.trip_id) >= 20 THEN
    RAISE EXCEPTION 'Maximum 20 notes par trajet autorisees';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_max_trip_notes ON public.trip_notes;
CREATE TRIGGER enforce_max_trip_notes
  BEFORE INSERT ON public.trip_notes
  FOR EACH ROW EXECUTE FUNCTION check_max_trip_notes();

-- ============================================
-- 6. TRIP_LOCATIONS: add lat/lng columns
-- ============================================
ALTER TABLE public.trip_locations
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Copy existing data
UPDATE public.trip_locations SET
  lat = COALESCE(lat, latitude),
  lng = COALESCE(lng, longitude);

-- Add composite index
CREATE INDEX IF NOT EXISTS idx_trip_locations_recorded ON public.trip_locations(trip_id, recorded_at DESC);

-- ============================================
-- 7. RLS POLICIES: add missing policies
-- ============================================

-- trips: missing DELETE policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can delete own trips'
  ) THEN
    CREATE POLICY "Users can delete own trips" ON public.trips
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- trip_notes: add DELETE policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'trip_notes' AND policyname = 'Users can delete own trip notes'
  ) THEN
    CREATE POLICY "Users can delete own trip notes" ON public.trip_notes
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.trips
          WHERE trips.id = trip_notes.trip_id
          AND trips.user_id = auth.uid()
        )
      );
  END IF;
END $$;
