-- Types enum pour les alertes
CREATE TYPE alert_type AS ENUM ('manual', 'automatic', 'timeout');
CREATE TYPE alert_status AS ENUM ('triggered', 'acknowledged', 'resolved', 'false_alarm');

-- Table alertes
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  status alert_status DEFAULT 'triggered',
  reason TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_lat DOUBLE PRECISION,
  triggered_lng DOUBLE PRECISION,
  battery_level INTEGER,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_trip_id ON public.alerts(trip_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_triggered_at ON public.alerts(triggered_at DESC);
