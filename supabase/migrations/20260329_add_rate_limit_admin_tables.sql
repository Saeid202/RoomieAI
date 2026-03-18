-- Document Rate Limit Admin Feature - Database Setup
-- Phase 1: Database Setup
-- Creates rate_limit_config, rate_limit_audit tables and RPC functions

-- =====================================================
-- 1.1 Create rate_limit_config table
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limit_config (
  config_key TEXT PRIMARY KEY,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_config_key ON rate_limit_config(config_key);

ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

-- RLS: Only super_admin can manage config
CREATE POLICY "Super admins can manage rate limit config"
  ON rate_limit_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

COMMENT ON TABLE rate_limit_config IS 'Stores configurable rate limiting parameters as key-value pairs';
COMMENT ON COLUMN rate_limit_config.config_key IS 'Unique identifier for the configuration option';
COMMENT ON COLUMN rate_limit_config.config_value IS 'The configuration value stored as text';
COMMENT ON COLUMN rate_limit_config.updated_by IS 'User ID of the administrator who last updated this value';

-- =====================================================
-- 1.2 Create rate_limit_audit table
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limit_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('request_allowed', 'request_blocked', 'config_change', 'user_reset')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id UUID,
  property_id UUID,
  ip_address TEXT,
  event_details JSONB DEFAULT '{}',
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON rate_limit_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON rate_limit_audit(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON rate_limit_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_admin_user_id ON rate_limit_audit(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_type_created ON rate_limit_audit(event_type, created_at DESC);

ALTER TABLE rate_limit_audit ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view audit log
CREATE POLICY "Admins can view rate limit audit log"
  ON rate_limit_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('super_admin', 'admin')
    )
  );

-- RLS: System can insert audit entries (called from RPC functions with SECURITY DEFINER)
CREATE POLICY "System can insert audit entries"
  ON rate_limit_audit
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE rate_limit_audit IS 'Records all document processing requests and administrative actions';
COMMENT ON COLUMN rate_limit_audit.event_type IS 'Type of event: request_allowed, request_blocked, config_change, user_reset';
COMMENT ON COLUMN rate_limit_audit.admin_user_id IS 'Administrator who performed the action (NULL for automatic events)';
COMMENT ON COLUMN rate_limit_audit.event_details IS 'Additional event-specific information stored as JSON';
COMMENT ON COLUMN rate_limit_audit.old_value IS 'Previous value for configuration changes';
COMMENT ON COLUMN rate_limit_audit.new_value IS 'New value for configuration changes';

-- =====================================================
-- 1.3 Seed initial configuration values
-- =====================================================
INSERT INTO rate_limit_config (config_key, config_value, description) VALUES
  ('global_enabled', 'true', 'Enable or disable rate limiting globally'),
  ('max_requests', '5', 'Maximum number of documents a user can process per time window'),
  ('time_window_minutes', '60', 'Time window duration in minutes for rate limiting'),
  ('cleanup_after_days', '90', 'Number of days to retain audit log entries')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- 1.4 get_rate_limit_config() RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION get_rate_limit_config()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_object_agg(config_key, config_value)
    FROM rate_limit_config
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.5 update_rate_limit_config() RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION update_rate_limit_config(
  p_config_key TEXT,
  p_config_value TEXT,
  p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_old_value TEXT;
  v_result JSON;
BEGIN
  -- Get old value for audit
  SELECT config_value INTO v_old_value
  FROM rate_limit_config
  WHERE config_key = p_config_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Configuration key not found: %', p_config_key;
  END IF;

  -- Update configuration
  UPDATE rate_limit_config
  SET config_value = p_config_value,
      updated_at = NOW(),
      updated_by = p_admin_user_id
  WHERE config_key = p_config_key;

  -- Create audit log entry
  INSERT INTO rate_limit_audit (
    event_type,
    admin_user_id,
    old_value,
    new_value,
    event_details
  ) VALUES (
    'config_change',
    p_admin_user_id,
    v_old_value,
    p_config_value,
    json_build_object('config_key', p_config_key)
  );

  v_result := json_build_object(
    'success', true,
    'config_key', p_config_key,
    'old_value', v_old_value,
    'new_value', p_config_value
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.6 get_rate_limit_stats() RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION get_rate_limit_stats()
RETURNS JSON AS $$
DECLARE
  v_max_requests INTEGER;
  v_time_window_minutes INTEGER;
  v_stats JSON;
  v_top_users JSON;
  v_blocked_users JSON;
  v_usage_distribution JSON;
  v_total_requests INTEGER;
BEGIN
  -- Get current configuration
  SELECT config_value::INTEGER INTO v_max_requests
  FROM rate_limit_config
  WHERE config_key = 'max_requests';

  SELECT config_value::INTEGER INTO v_time_window_minutes
  FROM rate_limit_config
  WHERE config_key = 'time_window_minutes';

  -- Get top 20 users by request count
  SELECT json_agg(
    json_build_object(
      'user_id', user_id,
      'request_count', request_count,
      'email', email,
      'full_name', raw_user_meta_data->>'full_name'
    )
  ) INTO v_top_users
  FROM (
    SELECT 
      dpr.user_id,
      COUNT(*) AS request_count,
      au.email,
      au.raw_user_meta_data
    FROM document_processing_requests dpr
    JOIN auth.users au ON dpr.user_id = au.id
    WHERE dpr.created_at > NOW() - (v_time_window_minutes || ' minutes')::INTERVAL
    GROUP BY dpr.user_id, au.email, au.raw_user_meta_data
    ORDER BY request_count DESC
    LIMIT 20
  ) sub;

  -- Get users who hit the rate limit
  SELECT json_agg(
    json_build_object(
      'user_id', user_id,
      'request_count', request_count,
      'email', email
    )
  ) INTO v_blocked_users
  FROM (
    SELECT 
      dpr.user_id,
      COUNT(*) AS request_count,
      au.email
    FROM document_processing_requests dpr
    JOIN auth.users au ON dpr.user_id = au.id
    WHERE dpr.created_at > NOW() - (v_time_window_minutes || ' minutes')::INTERVAL
    GROUP BY dpr.user_id, au.email
    HAVING COUNT(*) >= v_max_requests
  ) sub;

  -- Get usage distribution
  SELECT json_build_object(
    '0-25%', COALESCE(SUM(CASE WHEN percentiles.bucket = 1 THEN 1 ELSE 0 END), 0),
    '26-50%', COALESCE(SUM(CASE WHEN percentiles.bucket = 2 THEN 1 ELSE 0 END), 0),
    '51-75%', COALESCE(SUM(CASE WHEN percentiles.bucket = 3 THEN 1 ELSE 0 END), 0),
    '76-99%', COALESCE(SUM(CASE WHEN percentiles.bucket = 4 THEN 1 ELSE 0 END), 0),
    '100%', COALESCE(SUM(CASE WHEN percentiles.bucket = 5 THEN 1 ELSE 0 END), 0)
  ) INTO v_usage_distribution
  FROM (
    SELECT 
      CASE 
        WHEN request_count * 100 / v_max_requests <= 25 THEN 1
        WHEN request_count * 100 / v_max_requests <= 50 THEN 2
        WHEN request_count * 100 / v_max_requests <= 75 THEN 3
        WHEN request_count * 100 / v_max_requests < 100 THEN 4
        ELSE 5
      END AS bucket
    FROM (
      SELECT 
        dpr.user_id,
        COUNT(*) AS request_count
      FROM document_processing_requests dpr
      WHERE dpr.created_at > NOW() - (v_time_window_minutes || ' minutes')::INTERVAL
      GROUP BY dpr.user_id
    ) user_counts
  ) percentiles;

  -- Get total request count
  SELECT COUNT(*) INTO v_total_requests
  FROM document_processing_requests
  WHERE created_at > NOW() - (v_time_window_minutes || ' minutes')::INTERVAL;

  -- Build result
  v_stats := json_build_object(
    'max_requests', v_max_requests,
    'time_window_minutes', v_time_window_minutes,
    'total_requests', v_total_requests,
    'top_users', COALESCE(v_top_users, '[]'::JSON),
    'blocked_users', COALESCE(v_blocked_users, '[]'::JSON),
    'usage_distribution', v_usage_distribution
  );

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.7 get_rate_limit_audit_log() RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION get_rate_limit_audit_log(
  p_user_id UUID DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_start_time TIMESTAMPTZ DEFAULT NULL,
  p_end_time TIMESTAMPTZ DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 100
)
RETURNS JSON AS $$
DECLARE
  v_offset INTEGER;
  v_total_count INTEGER;
  v_results JSON;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM rate_limit_audit a
  LEFT JOIN auth.users au ON a.user_id = au.id
  LEFT JOIN auth.users admin_au ON a.admin_user_id = admin_au.id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
    AND (p_event_type IS NULL OR a.event_type = p_event_type)
    AND (p_start_time IS NULL OR a.created_at >= p_start_time)
    AND (p_end_time IS NULL OR a.created_at <= p_end_time);

  -- Get paginated results
  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'event_type', a.event_type,
      'user_id', a.user_id,
      'user_email', au.email,
      'admin_user_id', a.admin_user_id,
      'admin_email', admin_au.email,
      'document_id', a.document_id,
      'property_id', a.property_id,
      'ip_address', a.ip_address,
      'event_details', a.event_details,
      'old_value', a.old_value,
      'new_value', a.new_value,
      'created_at', a.created_at
    )
  ) INTO v_results
  FROM rate_limit_audit a
  LEFT JOIN auth.users au ON a.user_id = au.id
  LEFT JOIN auth.users admin_au ON a.admin_user_id = admin_au.id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
    AND (p_event_type IS NULL OR a.event_type = p_event_type)
    AND (p_start_time IS NULL OR a.created_at >= p_start_time)
    AND (p_end_time IS NULL OR a.created_at <= p_end_time)
  ORDER BY a.created_at DESC
  LIMIT p_page_size
  OFFSET v_offset;

  RETURN json_build_object(
    'data', COALESCE(v_results, '[]'::JSON),
    'pagination', json_build_object(
      'page', p_page,
      'page_size', p_page_size,
      'total_count', v_total_count,
      'total_pages', CEIL(v_total_count::FLOAT / p_page_size)::INTEGER
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.8 reset_user_rate_limit() RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION reset_user_rate_limit(
  p_user_id UUID,
  p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete user's request records
  DELETE FROM document_processing_requests
  WHERE user_id = p_user_id;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Create audit log entry
  INSERT INTO rate_limit_audit (
    event_type,
    user_id,
    admin_user_id,
    event_details
  ) VALUES (
    'user_reset',
    p_user_id,
    p_admin_user_id,
    json_build_object('deleted_count', v_deleted_count)
  );

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'deleted_count', v_deleted_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.9 Updated check_document_rate_limit() RPC function
-- Reads from rate_limit_config table instead of hardcoded values
-- =====================================================
CREATE OR REPLACE FUNCTION check_document_rate_limit(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_count INTEGER;
  v_allowed BOOLEAN := true;
  v_max_requests INTEGER;
  v_time_window_minutes INTEGER;
  v_global_enabled BOOLEAN;
  v_oldest_request TIMESTAMPTZ;
BEGIN
  -- Check if rate limiting is globally enabled
  SELECT config_value::BOOLEAN INTO v_global_enabled
  FROM rate_limit_config
  WHERE config_key = 'global_enabled';

  IF v_global_enabled = false OR v_global_enabled IS NULL THEN
    RETURN json_build_object('allowed', true, 'count', 0, 'limit', 0, 'global_disabled', true);
  END IF;

  -- Get configuration values
  SELECT config_value::INTEGER INTO v_max_requests
  FROM rate_limit_config
  WHERE config_key = 'max_requests';

  SELECT config_value::INTEGER INTO v_time_window_minutes
  FROM rate_limit_config
  WHERE config_key = 'time_window_minutes';

  -- Default values if not configured
  IF v_max_requests IS NULL THEN
    v_max_requests := 5;
  END IF;
  
  IF v_time_window_minutes IS NULL THEN
    v_time_window_minutes := 60;
  END IF;

  -- Count requests in the current time window
  SELECT COUNT(*), MAX(created_at) INTO v_count, v_oldest_request
  FROM document_processing_requests
  WHERE user_id = p_user_id
    AND created_at > NOW() - (v_time_window_minutes || ' minutes')::INTERVAL;

  IF v_count >= v_max_requests THEN
    v_allowed := false;
  END IF;

  RETURN json_build_object(
    'allowed', v_allowed, 
    'count', v_count, 
    'limit', v_max_requests,
    'retry_after_seconds', 
      CASE 
        WHEN v_allowed THEN 0
        ELSE GREATEST(0, EXTRACT(EPOCH FROM (v_oldest_request + (v_time_window_minutes || ' minutes')::INTERVAL - NOW()))::INTEGER)
      END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.10 Updated record_document_request() to log audit
-- =====================================================
CREATE OR REPLACE FUNCTION record_document_request(
  p_user_id UUID,
  p_document_id UUID,
  p_property_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  INSERT INTO document_processing_requests (user_id, document_id, property_id, ip_address)
  VALUES (p_user_id, p_document_id, p_property_id, p_ip_address)
  RETURNING id INTO v_request_id;

  -- Log to audit table
  INSERT INTO rate_limit_audit (
    event_type,
    user_id,
    document_id,
    property_id,
    ip_address,
    event_details
  ) VALUES (
    'request_allowed',
    p_user_id,
    p_document_id,
    p_property_id,
    p_ip_address,
    json_build_object('request_id', v_request_id)
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1.11 Add RLS policies for document_processing_requests
-- =====================================================
ALTER TABLE document_processing_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own records
CREATE POLICY "Users can view their own document processing requests"
  ON document_processing_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Super admins can view all records
CREATE POLICY "Super admins can view all document processing requests"
  ON document_processing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- =====================================================
-- Grant execute permissions to authenticated users
-- =====================================================
GRANT EXECUTE ON FUNCTION get_rate_limit_config() TO authenticated;
GRANT EXECUTE ON FUNCTION get_rate_limit_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_rate_limit_audit_log(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_document_rate_limit(UUID) TO authenticated;