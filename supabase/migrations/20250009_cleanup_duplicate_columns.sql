-- ============================================================
-- Migration: cleanup duplicate/legacy columns
-- Removes columns that were superseded by the align_schema migration
-- Applied via MCP on 2026-02-17
-- ============================================================

-- ============================================
-- 1. TRIPS: drop legacy origin_*/destination_*/estimated_arrival/actual_arrival
-- Data was already copied to departure_*/arrival_*/estimated_arrival_at/completed_at
-- ============================================
ALTER TABLE public.trips DROP COLUMN IF EXISTS origin_name;
ALTER TABLE public.trips DROP COLUMN IF EXISTS origin_address;
ALTER TABLE public.trips DROP COLUMN IF EXISTS origin_latitude;
ALTER TABLE public.trips DROP COLUMN IF EXISTS origin_longitude;
ALTER TABLE public.trips DROP COLUMN IF EXISTS destination_name;
ALTER TABLE public.trips DROP COLUMN IF EXISTS destination_address;
ALTER TABLE public.trips DROP COLUMN IF EXISTS destination_latitude;
ALTER TABLE public.trips DROP COLUMN IF EXISTS destination_longitude;
ALTER TABLE public.trips DROP COLUMN IF EXISTS estimated_arrival;
ALTER TABLE public.trips DROP COLUMN IF EXISTS actual_arrival;

-- Fix status default to 'draft' instead of 'scheduled'
ALTER TABLE public.trips ALTER COLUMN status SET DEFAULT 'draft';

-- ============================================
-- 2. TRIP_LOCATIONS: consolidate latitude/longitude -> lat/lng
-- ============================================
UPDATE public.trip_locations SET
  lat = COALESCE(lat, latitude),
  lng = COALESCE(lng, longitude);

ALTER TABLE public.trip_locations ALTER COLUMN lat SET NOT NULL;
ALTER TABLE public.trip_locations ALTER COLUMN lng SET NOT NULL;

ALTER TABLE public.trip_locations DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.trip_locations DROP COLUMN IF EXISTS longitude;

-- ============================================
-- 3. ALERTS: consolidate alert_type -> type, notes -> reason
-- ============================================
UPDATE public.alerts SET type = COALESCE(type, alert_type);
UPDATE public.alerts SET reason = COALESCE(reason, notes);

ALTER TABLE public.alerts ALTER COLUMN type SET NOT NULL;

ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE public.alerts DROP COLUMN IF EXISTS alert_type;
ALTER TABLE public.alerts DROP COLUMN IF EXISTS notes;

ALTER TABLE public.alerts ADD CONSTRAINT alerts_type_check
  CHECK (type = ANY (ARRAY['manual'::text, 'automatic'::text, 'timeout'::text, 'inactivity'::text, 'deviation'::text]));
