-- =============================================================================
-- Co-Ownership Matchmaking Tables
-- =============================================================================
-- MANUAL SETUP REQUIRED IN SUPABASE DASHBOARD:
--
-- 1. pg_cron schedule (6-hour matchmaking runs):
--    SELECT cron.schedule(
--      'co-ownership-matchmaking',
--      '0 */6 * * *',
--      $$SELECT net.http_post(
--        url := current_setting('app.supabase_url') || '/functions/v1/co-ownership-matchmaking-engine',
--        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
--      )$$
--    );
--
-- 2. 90-day event retention job:
--    SELECT cron.schedule(
--      'co-ownership-event-retention',
--      '0 3 * * *',
--      $$DELETE FROM co_ownership_match_events WHERE created_at < now() - INTERVAL '90 days'$$
--    );
--
-- Both jobs must be configured manually — they cannot be automated via migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table: co_ownership_matches
-- Stores pre-computed compatibility scores for each active profile pair.
-- user_id_1 < user_id_2 is enforced to guarantee canonical pair ordering.
-- ---------------------------------------------------------------------------
CREATE TABLE co_ownership_matches (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_canonical_order CHECK (user_id_1 < user_id_2),
  CONSTRAINT uq_match_pair UNIQUE (user_id_1, user_id_2),
  total_score               NUMERIC(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  score_tier                TEXT NOT NULL CHECK (score_tier IN ('exceptional', 'strong', 'good', 'possible')),
  financial_score           NUMERIC(5,2) NOT NULL CHECK (financial_score >= 0 AND financial_score <= 35),
  property_score            NUMERIC(5,2) NOT NULL CHECK (property_score >= 0 AND property_score <= 25),
  structure_score           NUMERIC(5,2) NOT NULL CHECK (structure_score >= 0 AND structure_score <= 25),
  quality_score             NUMERIC(5,2) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 10),
  bonus_score               NUMERIC(5,2) NOT NULL CHECK (bonus_score >= 0 AND bonus_score <= 5),
  sub_scores                JSONB NOT NULL DEFAULT '{}',
  -- sub_scores shape: { budget_overlap, down_payment_comp, income_comp, credit_compat,
  --                     location_overlap, property_type_overlap, timeline_alignment,
  --                     ownership_split, living_arrangement, purpose_alignment }
  ai_briefing_user_1        TEXT,
  ai_briefing_user_2        TEXT,
  gap_analysis              TEXT,
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at               TIMESTAMPTZ,
  notified_tier             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_user1 ON co_ownership_matches(user_id_1);
CREATE INDEX idx_matches_user2 ON co_ownership_matches(user_id_2);
CREATE INDEX idx_matches_score ON co_ownership_matches(total_score DESC);

-- ---------------------------------------------------------------------------
-- Table: co_ownership_connections
-- Tracks interaction state between two matched users.
-- user_id_1 < user_id_2 enforced for canonical ordering.
-- ---------------------------------------------------------------------------
CREATE TABLE co_ownership_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initiated_by    UUID NOT NULL REFERENCES auth.users(id),
  state           TEXT NOT NULL DEFAULT 'pending_chat'
                  CHECK (state IN ('pending_chat', 'active_chat', 'declined', 'blocked')),
  education_sent  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_connection_pair UNIQUE (user_id_1, user_id_2),
  CONSTRAINT chk_connection_order CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_connections_user1 ON co_ownership_connections(user_id_1);
CREATE INDEX idx_connections_user2 ON co_ownership_connections(user_id_2);

-- ---------------------------------------------------------------------------
-- Table: co_ownership_match_events
-- Audit log for each matchmaking engine run.
-- Retention: auto-delete events older than 90 days via pg_cron (see above).
-- ---------------------------------------------------------------------------
CREATE TABLE co_ownership_match_events (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                    UUID NOT NULL DEFAULT gen_random_uuid(),
  trigger_type              TEXT NOT NULL DEFAULT 'scheduled' CHECK (trigger_type IN ('scheduled', 'manual')),
  status                    TEXT NOT NULL DEFAULT 'running'
                            CHECK (status IN ('running', 'completed', 'failed')),
  started_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at              TIMESTAMPTZ,
  total_active_profiles     INTEGER,
  total_pairs_evaluated     INTEGER,
  total_pairs_filtered      INTEGER,
  filter_counts             JSONB DEFAULT '{}',
  -- filter_counts shape: { inactive, low_completeness, no_budget_overlap }
  total_pairs_scored        INTEGER,
  total_matches_stored      INTEGER,
  total_notifications_sent  INTEGER,
  total_briefings_generated INTEGER,
  error_message             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_events_started ON co_ownership_match_events(started_at DESC);

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

-- co_ownership_matches: users read only their own rows; engine writes via service role
ALTER TABLE co_ownership_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_matches" ON co_ownership_matches
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "service_role_write_matches" ON co_ownership_matches
  FOR ALL USING (auth.role() = 'service_role');

-- co_ownership_connections: users read/write their own connections
ALTER TABLE co_ownership_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_connections" ON co_ownership_connections
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "users_insert_connections" ON co_ownership_connections
  FOR INSERT WITH CHECK (
    auth.uid() = initiated_by AND
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
  );

CREATE POLICY "users_update_own_connections" ON co_ownership_connections
  FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- co_ownership_match_events: service role only
ALTER TABLE co_ownership_match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_events" ON co_ownership_match_events
  FOR ALL USING (auth.role() = 'service_role');
