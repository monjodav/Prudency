-- Table contacts de confiance
CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  notify_by_push BOOLEAN DEFAULT TRUE,
  notify_by_sms BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index pour les requêtes fréquentes
CREATE INDEX idx_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX idx_contacts_primary ON public.trusted_contacts(user_id, is_primary) WHERE is_primary = TRUE;

-- Contrainte: maximum 5 contacts par utilisateur
CREATE OR REPLACE FUNCTION check_max_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trusted_contacts WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 contacts de confiance autorisés';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_contacts
  BEFORE INSERT ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION check_max_contacts();
