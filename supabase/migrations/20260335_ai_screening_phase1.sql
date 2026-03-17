-- =====================================================
-- AI Screening Agent - Phase 1: Database Schema
-- =====================================================
-- Creates tables for screening rules, results, and audit logs

-- =====================================================
-- TABLE: ai_screening_rules
-- Stores landlord screening configuration
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_screening_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Agent behaviour mode
  behaviour_mode TEXT NOT NULL DEFAULT 'report_only' CHECK (behaviour_mode IN ('auto_approve', 'report_only', 'auto_decline')),
  
  -- Required documents (boolean flags)
  require_credit_report BOOLEAN NOT NULL DEFAULT true,
  require_payroll BOOLEAN NOT NULL DEFAULT true,
  require_employment_letter BOOLEAN NOT NULL DEFAULT false,
  require_reference_letter BOOLEAN NOT NULL DEFAULT false,
  
  -- Numeric thresholds
  min_credit_score INTEGER NOT NULL DEFAULT 650,
  min_income_to_rent_ratio DECIMAL(4,2) NOT NULL DEFAULT 2.50,
  min_employment_months INTEGER NOT NULL DEFAULT 3,
  
  -- Reference letter quality check
  assess_reference_quality BOOLEAN NOT NULL DEFAULT false,
  
  -- Per-property override (NULL = use global rules)
  property_id UUID NULL REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_screening_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Landlords can view their own screening rules"
  ON ai_screening_rules FOR SELECT
  TO authenticated
  USING (landlord_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Landlords can manage their own screening rules"
  ON ai_screening_rules FOR ALL
  TO authenticated
  USING (landlord_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_ai_screening_rules_landlord ON ai_screening_rules(landlord_id);
CREATE INDEX idx_ai_screening_rules_property ON ai_screening_rules(property_id);

-- Unique constraint: one rule set per landlord, optionally per property
CREATE UNIQUE INDEX idx_ai_screening_rules_unique 
ON ai_screening_rules(landlord_id, COALESCE(property_id, gen_random_uuid()));

-- =====================================================
-- TABLE: ai_screening_results
-- Stores per-application screening results
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Overall recommendation
  overall_result TEXT NOT NULL CHECK (overall_result IN ('approved', 'conditional', 'declined', 'pending', 'error')),
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  
  -- Document completeness check
  documents_complete BOOLEAN NOT NULL DEFAULT false,
  missing_documents TEXT[] DEFAULT '{}',
  
  -- Extracted data (JSON for flexibility)
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Rule evaluation results
  rule_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- AI summary (plain English)
  ai_summary TEXT NOT NULL DEFAULT '',
  
  -- Processing metadata
  processed_at TIMESTAMPTZ NULL,
  processing_duration_ms INTEGER NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_screening_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Landlords can view screening results for their applications"
  ON ai_screening_results FOR SELECT
  TO authenticated
  USING (landlord_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "System can insert screening results"
  ON ai_screening_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Landlords can update their own screening results"
  ON ai_screening_results FOR UPDATE
  TO authenticated
  USING (landlord_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

-- Indexes
CREATE INDEX idx_ai_screening_results_application ON ai_screening_results(application_id);
CREATE INDEX idx_ai_screening_results_landlord ON ai_screening_results(landlord_id);
CREATE INDEX idx_ai_screening_results_created ON ai_screening_results(created_at DESC);

-- =====================================================
-- TABLE: ai_screening_logs
-- Audit trail for legal compliance (Canadian human rights)
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_screening_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Action type
  action_type TEXT NOT NULL CHECK (action_type IN (
    'screening_started',
    'document_checked',
    'data_extracted',
    'rule_evaluated',
    'decision_made',
    'landlord_override',
    'notification_sent',
    'error_occurred'
  )),
  
  -- Action details
  action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Document reference (if applicable)
  document_type TEXT NULL,
  document_path TEXT NULL,
  
  -- Rule reference (if applicable)
  rule_name TEXT NULL,
  rule_threshold TEXT NULL,
  extracted_value TEXT NULL,
  rule_result TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_screening_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Read-only for landlords (audit purposes)
CREATE POLICY "Landlords can view their own screening logs"
  ON ai_screening_logs FOR SELECT
  TO authenticated
  USING (landlord_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "Tenants can view their own screening logs"
  ON ai_screening_logs FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT id FROM user_profiles WHERE auth_uid = auth.uid()));

CREATE POLICY "System can insert screening logs"
  ON ai_screening_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for audit queries
CREATE INDEX idx_ai_screening_logs_application ON ai_screening_logs(application_id);
CREATE INDEX idx_ai_screening_logs_landlord ON ai_screening_logs(landlord_id);
CREATE INDEX idx_ai_screening_logs_tenant ON ai_screening_logs(tenant_id);
CREATE INDEX idx_ai_screening_logs_action ON ai_screening_logs(action_type);
CREATE INDEX idx_ai_screening_logs_created ON ai_screening_logs(created_at DESC);

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_ai_screening_timestamps()
RETURNS TRIGGER AS
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_ai_screening_rules_timestamp
  BEFORE UPDATE ON ai_screening_rules
  FOR EACH ROW EXECUTE FUNCTION update_ai_screening_timestamps();

CREATE TRIGGER update_ai_screening_results_timestamp
  BEFORE UPDATE ON ai_screening_results
  FOR EACH ROW EXECUTE FUNCTION update_ai_screening_timestamps();

-- =====================================================
-- DEFAULT RULES SETUP
-- Insert default screening rules for existing landlords
-- =====================================================

INSERT INTO ai_screening_rules (landlord_id, behaviour_mode)
SELECT id, 'report_only'
FROM user_profiles
WHERE role = 'landlord'
ON CONFLICT (landlord_id, COALESCE(property_id, '00000000-0000-0000-0000-000000000000'::UUID))
DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE ai_screening_rules IS 'Landlord AI screening configuration - mode, thresholds, required documents';
COMMENT ON TABLE ai_screening_results IS 'Per-application AI screening results - extracted data, rule results, overall recommendation';
COMMENT ON TABLE ai_screening_logs IS 'Audit trail for legal compliance - every AI action is logged permanently';
COMMENT ON COLUMN ai_screening_rules.behaviour_mode IS 'auto_approve, report_only, or auto_decline';
COMMENT ON COLUMN ai_screening_results.overall_result IS 'approved, conditional, declined, pending, or error';
COMMENT ON COLUMN ai_screening_logs.action_type IS 'Type of screening action performed';