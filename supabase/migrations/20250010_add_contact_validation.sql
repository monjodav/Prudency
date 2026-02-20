-- Add contact validation columns to trusted_contacts
ALTER TABLE public.trusted_contacts
  ADD COLUMN validation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'accepted', 'refused')),
  ADD COLUMN invitation_token TEXT UNIQUE,
  ADD COLUMN invitation_sent_at TIMESTAMPTZ,
  ADD COLUMN invitation_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for token lookups (used when accepting invitations)
CREATE INDEX idx_contacts_invitation_token
  ON public.trusted_contacts(invitation_token)
  WHERE invitation_token IS NOT NULL;
