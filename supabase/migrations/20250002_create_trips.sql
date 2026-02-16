-- Types enum
CREATE TYPE trip_status AS ENUM ('draft', 'active', 'completed', 'cancelled', 'timeout', 'alerted');

-- Table trajets
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status trip_status DEFAULT 'draft',
  departure_address TEXT,
  departure_lat DOUBLE PRECISION,
  departure_lng DOUBLE PRECISION,
  arrival_address TEXT,
  arrival_lat DOUBLE PRECISION,
  arrival_lng DOUBLE PRECISION,
  estimated_duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  estimated_arrival_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour requêtes fréquentes
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_active ON public.trips(user_id, status) WHERE status = 'active';
CREATE INDEX idx_trips_estimated_arrival ON public.trips(estimated_arrival_at) WHERE status = 'active';
