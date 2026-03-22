-- Phase 1: match_requests table for Homie Connect double opt-in flow
-- Tracks connection requests between users across all intent types

CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,           -- requester (Telegram/WhatsApp/phone ID or UUID)
  match_user_id TEXT NOT NULL,     -- the matched user
  intent TEXT NOT NULL CHECK (intent IN ('ROOMMATE', 'COBUY', 'EXPERT', 'RENOVATION')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'user_a_accepted', 'matched', 'expired', 'declined')
  ),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate pending requests between the same pair
  CONSTRAINT unique_active_pair UNIQUE (user_id, match_user_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_match_requests_user_id ON match_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_match_user_id ON match_requests (match_user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests (status);
CREATE INDEX IF NOT EXISTS idx_match_requests_expires_at ON match_requests (expires_at);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_match_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS match_requests_updated_at ON match_requests;
CREATE TRIGGER match_requests_updated_at
  BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_match_requests_updated_at();

-- Auto-expire: mark requests as expired when expires_at passes
-- (Run this periodically via pg_cron or a scheduled job)
-- Example: SELECT expire_stale_match_requests();
CREATE OR REPLACE FUNCTION expire_stale_match_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE match_requests
  SET status = 'expired'
  WHERE status IN ('pending', 'user_a_accepted')
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- RLS: Homie Connect runs server-side with service role, so RLS is not required.
-- Enable it only if you expose this table via PostgREST/client SDK.
-- ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
