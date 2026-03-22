-- Track renovation match acceptances for double opt-in flow
CREATE TABLE IF NOT EXISTS renovation_match_acceptances (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID NOT NULL,
  customer_id BIGINT NOT NULL,
  renovator_id BIGINT NOT NULL,
  customer_accepted BOOLEAN DEFAULT FALSE,
  renovator_accepted BOOLEAN DEFAULT FALSE,
  both_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(request_id, customer_id, renovator_id)
);

-- Index for quick lookups
CREATE INDEX idx_renovation_match_acceptances_ids 
  ON renovation_match_acceptances(customer_id, renovator_id);

CREATE INDEX idx_renovation_match_acceptances_request 
  ON renovation_match_acceptances(request_id);

-- Disable RLS for now (same as other renovation tables)
ALTER TABLE renovation_match_acceptances DISABLE ROW LEVEL SECURITY;
