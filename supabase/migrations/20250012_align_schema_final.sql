-- Alignement final du schema avec le code applicatif

-- 1. profiles: ajout phone_verified
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- 2. trips: conversion status enum -> TEXT + CHECK
ALTER TABLE public.trips ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE public.trips ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE public.trips ADD CONSTRAINT trips_status_check
  CHECK (status IN ('draft', 'active', 'scheduled', 'paused', 'completed', 'cancelled', 'timeout', 'alerted', 'alert'));
DROP TYPE IF EXISTS trip_status;

-- 2b. trips: ajout colonnes manquantes
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS transport_mode TEXT CHECK (transport_mode IN ('walk', 'car', 'transit', 'bike', 'other')),
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validation_code TEXT,
  ADD COLUMN IF NOT EXISTS trusted_contact_id UUID REFERENCES public.trusted_contacts(id);

-- 3. trip_notes: ajout is_encrypted
ALTER TABLE public.trip_notes
  ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
