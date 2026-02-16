-- Table notes de trajet
CREATE TABLE public.trip_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX idx_trip_notes_trip_id ON public.trip_notes(trip_id);
CREATE INDEX idx_trip_notes_created_at ON public.trip_notes(trip_id, created_at DESC);

-- Contrainte: maximum 20 notes par trajet
CREATE OR REPLACE FUNCTION check_max_trip_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trip_notes WHERE trip_id = NEW.trip_id) >= 20 THEN
    RAISE EXCEPTION 'Maximum 20 notes par trajet autorisées';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_trip_notes
  BEFORE INSERT ON public.trip_notes
  FOR EACH ROW EXECUTE FUNCTION check_max_trip_notes();
