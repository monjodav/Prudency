-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES: lecture/écriture propre profil uniquement
-- ============================================
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TRIPS: CRUD propre trajets uniquement
-- ============================================
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ALERTS: lecture/écriture propre alertes
-- ============================================
CREATE POLICY "Users can view own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON public.alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- CONTACTS DE CONFIANCE: CRUD propre contacts
-- ============================================
CREATE POLICY "Users can view own contacts" ON public.trusted_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts" ON public.trusted_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON public.trusted_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON public.trusted_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- NOTES: CRUD propre notes
-- ============================================
CREATE POLICY "Users can view own trip notes" ON public.trip_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trip notes" ON public.trip_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trip notes" ON public.trip_notes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LOCATIONS: lecture/écriture propres positions
-- ============================================
CREATE POLICY "Users can view own trip locations" ON public.trip_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_locations.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trip locations" ON public.trip_locations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_locations.trip_id
      AND trips.user_id = auth.uid()
    )
  );
