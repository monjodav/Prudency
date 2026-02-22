-- M-06: CHECK constraint on trusted_contacts.phone (E.164 format)
ALTER TABLE public.trusted_contacts
  ADD CONSTRAINT trusted_contacts_phone_format
  CHECK (phone ~ '^\+[1-9]\d{1,14}$');

-- M-07: CHECK constraints on trip_locations.lat/lng range
ALTER TABLE public.trip_locations
  ADD CONSTRAINT trip_locations_lat_range
  CHECK (lat BETWEEN -90 AND 90),
  ADD CONSTRAINT trip_locations_lng_range
  CHECK (lng BETWEEN -180 AND 180);
