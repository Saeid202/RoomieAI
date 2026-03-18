# Document Rate Limit Admin Feature Design

## Overview

This document provides the comprehensive design for the Document Rate Limit Admin feature, which extends the existing document processing rate limiting system with administrative controls for configuration, monitoring, and management. The feature enables administrators to adjust rate limits dynamically, view usage statistics, and audit system activity without requiring code deployments.

The design builds upon the existing `document_processing_requests` table and `check_document_rate_limit()` RPC function established in migration `20260328_add_document_rate_limiting.sql`. The new system introduces configuration management, audit logging, statistics aggregation, and a dedicated admin interface.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN INTERFACE LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │              /dashboard/admin/rate-limit-management Page                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │    │
│  │  │ Config Panel │  │ Stats Panel  │  │ Audit Viewer │  │ User Reset │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    admin-rate-limit-config Edge Function                 │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │    │
│  │  │ GET /config     - Retrieve current rate limit configuration      │    │    │
│  │  │ POST /config    - Update rate limit configuration                │    │    │
│  │  │ GET /stats      - Retrieve rate limit usage statistics           │    │    │
│  │  │ GET /audit      - Retrieve audit log entries                     │    │    │
│  │  │ POST /reset     - Reset user rate limit counters                 │    │    │
│  │  └─────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │  rate_limit_config  │  │  rate_limit_audit   │  │  document_processing_   │  │
│  │      (NEW)          │  │       (NEW)         │  │      requests           │  │
│  │                     │  │                     │  │      (EXISTING)         │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────┘  │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         RPC FUNCTIONS                                    │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │    │
│  │  │ get_rate_limit_config()        - Retrieve configuration values  │    │    │
│  │  │ update_rate_limit_config()     - Update configuration values    │    │    │
│  │  │ get_rate_limit_stats()         - Aggregate usage statistics     │    │    │
│  │  │ get_rate_limit_audit_log()     - Query audit entries            │    │    │
│  │  │ reset_user_rate_limit()        - Clear user's request records   │    │    │
│  │  │ check_document_rate_limit()    - Existing rate limit check      │    │    │
│  │  │ record_document_request()      - Existing request recording      │    │    │
│  │  └─────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RATE LIMIT ENFORCEMENT                                 │
│  ┌───────────���─────────────────────────────────────────────────────────────┐    │
│  │  Document Processing Endpoints (OCR, Gemini AI)                         │    │
│  │  - check_document_rate_limit() called before processing                 │    │
│  │  - record_document_request() called after successful processing         │    │
│  │  - Rate limit exceeded returns 429 status with retry-after header       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Interactions

The admin interface communicates exclusively through the `admin-rate-limit-config` edge function, which enforces authorization checks for the `super_admin` role. All configuration changes and administrative actions are logged to the `rate_limit_audit` table for compliance and auditing purposes. The rate limiter itself continues to use the existing `check_document_rate_limit()` and `record_document_request()` functions, which now read configuration values from the new `rate_limit_config` table instead of hardcoded constants.

## Components and Interfaces

### Database Components

The database layer consists of three primary tables. The `rate_limit_config` table stores all configurable parameters as key-value pairs, providing flexibility for future configuration additions without schema changes. The `rate_limit_audit` table records all document processing requests and administrative actions, supporting compliance requirements and troubleshooting. The existing `document_processing_requests` table continues to store individual request records, which are used for statistics aggregation and audit trail generation.

### RPC Functions

The system introduces five new RPC functions for administrative operations. The `get_rate_limit_config()` function retrieves all configuration values as a JSON object. The `update_rate_limit_config()` function accepts a configuration key and value, validates the input, updates the configuration, and creates an audit log entry. The `get_rate_limit_stats()` function aggregates request data to produce statistics for the admin dashboard. The `get_rate_limit_audit_log()` function supports filtered and paginated audit log queries. The `reset_user_rate_limit()` function clears a user's request records and creates an audit log entry.

### Edge Function

The `admin-rate-limit-config` edge function serves as the single entry point for all admin operations. It handles authentication verification, role authorization, request validation, and response formatting. The function supports GET requests for retrieving data and POST requests for configuration updates and administrative actions.

### Frontend Components

The admin interface consists of four main components. The `RateLimitConfigPanel` component displays and edits global configuration settings. The `RateLimitStatsDashboard` component shows usage statistics with charts and tables. The `RateLimitAuditLog` component provides a filterable and paginated view of audit entries. The `RateLimitUserReset` component enables administrators to reset rate limits for individual or multiple users.

## Data Models

### rate_limit_config Table

The configuration table uses a key-value pattern to store rate limiting parameters. This approach allows adding new configuration options without schema migrations, supporting the evolving needs of the rate limiting system.

```sql
CREATE TABLE IF NOT EXISTS rate_limit_config (
  config_key TEXT PRIMARY KEY,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE rate_limit_config IS 'Stores configurable rate limiting parameters as key-value pairs';
COMMENT ON COLUMN rate_limit_config.config_key IS 'Unique identifier for the configuration option';
COMMENT ON COLUMN rate_limit_config.config_value IS 'The configuration value stored as text';
COMMENT ON COLUMN rate_limit_config.updated_by IS 'User ID of the administrator who last updated this value';
```

### rate_limit_audit Table

The audit table records all document processing requests and administrative actions. This design supports the compliance requirement of retaining records for a minimum of 90 days while enabling efficient querying for the admin interface.

```sql
CREATE TABLE IF NOT EXISTS rate_limit_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id UUID,
  property_id UUID,
  ip_address TEXT,
  event_details JSONB,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_event_type ON rate_limit_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON rate_limit_audit(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON rate_limit_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_admin_user_id ON rate_limit_audit(admin_user_id, created_at DESC);

COMMENT ON TABLE rate_limit_audit IS 'Records all document processing requests and administrative actions';
COMMENT ON COLUMN rate_limit_audit.event_type IS 'Type of event: request_allowed, request_blocked, config_change, user_reset';
COMMENT ON COLUMN rate_limit_audit.admin_user_id IS 'Administrator who performed the action (NULL for automatic events)';
COMMENT ON COLUMN rate_limit_audit.event_details IS 'Additional event-specific information stored as JSON';
COMMENT ON COLUMN rate_limit_audit.old_value IS 'Previous value for configuration changes';
COMMENT ON COLUMN rate_limit_audit.new_value IS 'New value for configuration changes';
```

### Initial Configuration Values

The following configuration entries are seeded on first deployment:

```sql
INSERT INTO rate_limit_config (config_key, config_value, description) VALUES
  ('global_enabled', 'true', 'Enable or disable rate limiting globally'),
  ('max_requests', '5', 'Maximum number of documents a user can process per time window'),
  ('time_window_minutes', '60', 'Time window duration in minutes for rate limiting'),
  ('cleanup_after_days', '90', 'Number of days to retain audit log entries')
ON CONFLICT (config_key) DO NOTHING;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Configuration Persistence

*For any* configuration update operation, the new configuration value must be immediately readable by subsequent rate limit checks.

**Validates: Requirements 8.1, 8.2**

### Property 2: Rate Limit Enforcement Consistency

*For any* document processing request, the rate limiter must apply the same configuration values throughout the request's evaluation, preventing configuration changes mid-request from affecting the outcome.

**Validates: Requirements 7.1, 7.2, Edge Case 2**

### Property 3: Audit Log Completeness

*For any* document processing request or administrative action, the system must create exactly one audit log entry with the correct event type and all relevant details.

**Validates: Requirements 1.3, 2.3, 3.4, 5.3, 6.6**

### Property 4: User Reset Effectiveness

*For any* user whose rate limit is reset, the count of requests in the current time window must be zero immediately after the reset operation completes.

**Validates: Requirements 5.1, 5.6**

### Property 5: Atomic Rate Limit Check

*For any* concurrent document processing requests from the same user, the rate limit check must count each request exactly once, regardless of request timing or database load.

**Validates: Requirements 7.4, Edge Case 1**

## Error Handling

### Database Errors

Database connection failures are handled gracefully with retry logic in the edge function. If the database becomes unavailable, the rate limiter defaults to allowing requests to prevent blocking legitimate traffic during outages. This behavior aligns with the technical constraint of handling database connection failures gracefully.

Configuration update errors include detailed error messages returned to the admin interface, enabling administrators to understand and resolve issues. Validation errors for configuration values return specific error messages indicating which field failed validation and why.

### Rate Limit Errors

When a request exceeds the rate limit, the system returns a 429 Too Many Requests status code with a JSON response containing the current count, limit, and recommended retry-after time. The retry-after header indicates the number of seconds until the rate limit resets, calculated based on the oldest request in the current time window.

### Authorization Errors

Unauthorized access attempts to the admin interface or edge function return a 403 Forbidden status with an error message indicating insufficient permissions. Failed authentication attempts are not logged to prevent audit log flooding, but may be tracked in a separate security log if needed.

## Testing Strategy

### Unit Testing

Unit tests verify specific examples and edge cases for the administrative functions. Key unit test scenarios include configuration validation with valid and invalid inputs, audit log entry creation with all event types, user reset functionality with single and multiple users, and error handling for database failures and authorization errors.

### Property-Based Testing

Property-based tests verify universal properties across all valid inputs. The configuration persistence property tests that any configuration value written to the database can be read back identically. The audit log completeness property tests that for any administrative action, the audit log contains exactly one matching entry. The rate limit enforcement property tests that for any user and any configuration, the rate limiter correctly allows or blocks requests based on the configured limits.

### Test Configuration

Property-based tests run with a minimum of 100 iterations using randomly generated inputs within valid ranges. Each test is tagged with the feature name and property number for traceability. Tests are implemented using the Vitest framework with the fast-check library for property-based testing capabilities.

### Test Tags

All property-based tests include the following tag format: `Feature: document-rate-limit-admin, Property {number}: {property_description}`. This tagging enables filtering tests by feature and property during test execution and reporting.

## Implementation Notes

### Migration Strategy

The implementation requires a two-phase migration approach. Phase one creates the new tables and RPC functions while the existing rate limiter continues using hardcoded values. Phase two updates the existing `check_document_rate_limit()` function to read configuration from the database and deploys the admin interface. This approach minimizes risk by allowing rollback to the previous behavior if issues are discovered.

### Performance Considerations

The `document_processing_requests` table is expected to grow significantly over time. The existing index on `user_id, created_at DESC` supports efficient rate limit queries. For statistics aggregation, consider creating a materialized view that refreshes hourly to avoid expensive queries on large tables. The audit log table should implement automatic cleanup using a scheduled job or database trigger to remove entries older than the configured retention period.

### Security Considerations

All admin operations require the `super_admin` role, enforced at both the edge function and database levels. The `rate_limit_config` table should have Row Level Security policies preventing non-super-admin users from reading or modifying configuration. Audit log entries include the admin user ID for accountability, and configuration changes store both old and new values for change tracking.

### Future Extensibility

The key-value configuration design allows adding new rate limiting parameters without schema changes. Examples of future extensions include per-property rate limits, different rate limit algorithms (token bucket, sliding window), and rate limit tiers based on user subscription level. The audit log's JSONB `event_details` column supports storing additional event-specific information for future features.

## Low-Level Design

### Database Schema SQL

#### rate_limit_config Table

```sql
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
```

#### rate_limit_audit Table

```sql
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

CREATE POLICY "System can insert audit entries"
  ON rate_limit_audit
  FOR INSERT
  WITH CHECK (true);
```

### RPC Function Definitions

#### get_rate_limit_config()

```sql
CREATE OR REPLACE FUNCTION get_rate_limit_config()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_object_agg(config_key, config_value)
    FROM rate_limit_config
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### update_rate_limit_config()

```sql
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
```

#### get_rate_limit_stats()

```sql
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
```

#### get_rate_limit_audit_log()

```sql
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
```

#### reset_user_rate_limit()

```sql
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
```

#### Updated check_document_rate_limit()

```sql
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

  IF v_global_enabled = false THEN
    RETURN json_build_object('allowed', true, 'count', 0, 'limit', 0, 'global_disabled', true);
  END IF;

  -- Get configuration values
  SELECT config_value::INTEGER INTO v_max_requests
  FROM rate_limit_config
  WHERE config_key = 'max_requests';

  SELECT config_value::INTEGER INTO v_time_window_minutes
  FROM rate_limit_config
  WHERE config_key = 'time_window_minutes';

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
        ELSE EXTRACT(EPOCH FROM (v_oldest_request + (v_time_window_minutes || ' minutes')::INTERVAL - NOW()))::INTEGER
      END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Edge Function: admin-rate-limit-config

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Check super_admin role
    const { data: userData } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (userData?.raw_user_meta_data?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions. Super admin role required.' });
    }

    const { method, query, body } = req;

    switch (method) {
      case 'GET':
        return handleGetRequest(supabase, query, res);
      case 'POST':
        return handlePostRequest(supabase, body, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin rate limit config error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetRequest(supabase, query, res) {
  const { action } = query;

  switch (action) {
    case 'config': {
      const { data, error } = await supabase
        .rpc('get_rate_limit_config');
      
      if (error) throw error;
      return res.status(200).json({ config: data });
    }

    case 'stats': {
      const { data, error } = await supabase
        .rpc('get_rate_limit_stats');
      
      if (error) throw error;
      return res.status(200).json({ stats: data });
    }

    case 'audit': {
      const { 
        user_id, 
        event_type, 
        start_time, 
        end_time, 
        page = '1', 
        page_size = '100' 
      } = query;

      const { data, error } = await supabase
        .rpc('get_rate_limit_audit_log', {
          p_user_id: user_id || null,
          p_event_type: event_type || null,
          p_start_time: start_time || null,
          p_end_time: end_time || null,
          p_page: parseInt(page),
          p_page_size: parseInt(page_size)
        });
      
      if (error) throw error;
      return res.status(200).json(data);
    }

    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handlePostRequest(supabase, body, res) {
  const { action } = body;

  switch (action) {
    case 'update_config': {
      const { config_key, config_value } = body;

      if (!config_key || config_value === undefined) {
        return res.status(400).json({ error: 'Missing config_key or config_value' });
      }

      // Validate config key
      const validKeys = ['global_enabled', 'max_requests', 'time_window_minutes', 'cleanup_after_days'];
      if (!validKeys.includes(config_key)) {
        return res.status(400).json({ error: `Invalid config key. Valid keys: ${validKeys.join(', ')}` });
      }

      // Validate config value based on key
      if (config_key === 'max_requests') {
        const numValue = parseInt(config_value);
        if (isNaN(numValue) || numValue < 1 || numValue > 1000) {
          return res.status(400).json({ error: 'max_requests must be between 1 and 1000' });
        }
      }

      if (config_key === 'time_window_minutes') {
        const numValue = parseInt(config_value);
        if (isNaN(numValue) || numValue < 1 || numValue > 1440) {
          return res.status(400).json({ error: 'time_window_minutes must be between 1 and 1440 (24 hours)' });
        }
      }

      if (config_key === 'global_enabled') {
        if (config_value !== 'true' && config_value !== 'false') {
          return res.status(400).json({ error: 'global_enabled must be true or false' });
        }
      }

      const { data, error } = await supabase
        .rpc('update_rate_limit_config', {
          p_config_key: config_key,
          p_config_value: String(config_value),
          p_admin_user_id: body.admin_user_id
        });

      if (error) throw error;
      return res.status(200).json(data);
    }

    case 'reset_user': {
      const { user_id } = body;

      if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id' });
      }

      const { data, error } = await supabase
        .rpc('reset_user_rate_limit', {
          p_user_id: user_id,
          p_admin_user_id: body.admin_user_id
        });

      if (error) throw error;
      return res.status(200).json(data);
    }

    case 'bulk_reset_users': {
      const { user_ids } = body;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ error: 'user_ids must be a non-empty array' });
      }

      // Process in batches to avoid timeouts
      const batchSize = 100;
      const results = [];

      for (let i = 0; i < user_ids.length; i += batchSize) {
        const batch = user_ids.slice(i, i + batchSize);
        
        for (const userId of batch) {
          const { data, error } = await supabase
            .rpc('reset_user_rate_limit', {
              p_user_id: userId,
              p_admin_user_id: body.admin_user_id
            });
          
          if (error) {
            results.push({ user_id: userId, success: false, error: error.message });
          } else {
            results.push({ user_id: userId, success: true, data });
          }
        }
      }

      return res.status(200).json({ results });
    }

    case 'export_audit': {
      const { start_time, end_time, event_type } = body;

      const { data, error } = await supabase
        .rpc('get_rate_limit_audit_log', {
          p_user_id: null,
          p_event_type: event_type || null,
          p_start_time: start_time || null,
          p_end_time: end_time || null,
          p_page: 1,
          p_page_size: 10000
        });

      if (error) throw error;

      // Convert to CSV
      const csv = convertToCSV(data.data);
      
      return res.status(200)
        .setHeader('Content-Type', 'text/csv')
        .setHeader('Content-Disposition', 'attachment; filename=rate-limit-audit-log.csv')
        .send(csv);
    }

    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Event Type',
    'User ID',
    'User Email',
    'Admin User ID',
    'Admin Email',
    'Document ID',
    'Property ID',
    'IP Address',
    'Old Value',
    'New Value',
    'Created At'
  ];

  const rows = data.map(row => [
    row.id,
    row.event_type,
    row.user_id || '',
    row.user_email || '',
    row.admin_user_id || '',
    row.admin_email || '',
    row.document_id || '',
    row.property_id || '',
    row.ip_address || '',
    row.old_value || '',
    row.new_value || '',
    row.created_at
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
```

### Frontend Component Structure

#### RateLimitConfigPanel.tsx

```typescript
interface ConfigPanelProps {
  config: RateLimitConfig;
  onUpdateConfig: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
}

interface RateLimitConfig {
  global_enabled: string;
  max_requests: string;
  time_window_minutes: string;
  cleanup_after_days: string;
}

export function RateLimitConfigPanel({ config, onUpdateConfig, isLoading }: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdateConfig('global_enabled', localConfig.global_enabled);
    await onUpdateConfig('max_requests', localConfig.max_requests);
    await onUpdateConfig('time_window_minutes', localConfig.time_window_minutes);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <div className="config-panel">
      <h2>Rate Limit Configuration</h2>
      
      <div className="config-field">
        <label>
          <input
            type="checkbox"
            checked={localConfig.global_enabled === 'true'}
            onChange={(e) => handleChange('global_enabled', e.target.checked ? 'true' : 'false')}
          />
          Enable Rate Limiting Globally
        </label>
      </div>

      <div className="config-field">
        <label>
          Max Requests (1-1000)
          <input
            type="number"
            min="1"
            max="1000"
            value={localConfig.max_requests}
            onChange={(e) => handleChange('max_requests', e.target.value)}
          />
        </label>
      </div>

      <div className="config-field">
        <label>
          Time Window (minutes, 1-1440)
          <input
            type="number"
            min="1"
            max="1440"
            value={localConfig.time_window_minutes}
            onChange={(e) => handleChange('time_window_minutes', e.target.value)}
          />
        </label>
      </div>

      {hasChanges && (
        <div className="config-actions">
          <button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
```

#### RateLimitStatsDashboard.tsx

```typescript
interface StatsDashboardProps {
  stats: RateLimitStats;
  onRefresh: () => void;
  onResetUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

interface RateLimitStats {
  max_requests: number;
  time_window_minutes: number;
  total_requests: number;
  top_users: Array<{ user_id: string; request_count: number; email: string }>;
  blocked_users: Array<{ user_id: string; request_count: number; email: string }>;
  usage_distribution: Record<string, number>;
}

export function RateLimitStatsDashboard({ stats, onRefresh, onResetUser, isLoading }: StatsDashboardProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkReset = async () => {
    for (const userId of selectedUsers) {
      await onResetUser(userId);
    }
    setSelectedUsers([]);
  };

  return (
    <div className="stats-dashboard">
      <div className="stats-header">
        <h2>Rate Limit Statistics</h2>
        <button onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-value">{stats.total_requests}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.max_requests}</span>
          <span className="stat-label">Max Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.time_window_minutes}m</span>
          <span className="stat-label">Time Window</span>
        </div>
      </div>

      <div className="usage-distribution">
        <h3>Usage Distribution</h3>
        <div className="distribution-bars">
          {Object.entries(stats.usage_distribution).map(([range, count]) => (
            <div key={range} className="distribution-bar">
              <span className="range-label">{range}</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(count / stats.total_requests) * 100}%` }}
                />
              </div>
              <span className="count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="top-users">
        <h3>Top Users by Request Count</h3>
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Email</th>
              <th>Request Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_users.map(user => (
              <tr key={user.user_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.user_id)}
                    onChange={() => handleUserSelect(user.user_id)}
                  />
                </td>
                <td>{user.email}</td>
                <td>{user.request_count}</td>
                <td>
                  <button onClick={() => onResetUser(user.user_id)}>
                    Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <button onClick={handleBulkReset}>
            Reset {selectedUsers.length} Selected Users
          </button>
        </div>
      )}
    </div>
  );
}
```

#### RateLimitAuditLog.tsx

```typescript
interface AuditLogProps {
  auditData: AuditLogResponse;
  onFilterChange: (filters: AuditFilters) => void;
  onExport: () => void;
  isLoading: boolean;
}

interface AuditFilters {
  user_id?: string;
  event_type?: string;
  start_time?: string;
  end_time?: string;
}

interface AuditLogResponse {
  data: AuditEntry[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export function RateLimitAuditLog({ auditData, onFilterChange, onExport, isLoading }: AuditLogProps) {
  const [filters, setFilters] = useState<AuditFilters>({});

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="audit-log">
      <div className="audit-header">
        <h2>Audit Log</h2>
        <button onClick={onExport} disabled={isLoading}>
          Export CSV
        </button>
      </div>

      <div className="audit-filters">
        <input
          type="text"
          placeholder="Filter by User ID"
          onChange={(e) => handleFilterChange('user_id', e.target.value)}
        />
        <select onChange={(e) => handleFilterChange('event_type', e.target.value)}>
          <option value="">All Event Types</option>
          <option value="request_allowed">Request Allowed</option>
          <option value="request_blocked">Request Blocked</option>
          <option value="config_change">Config Change</option>
          <option value="user_reset">User Reset</option>
        </select>
        <input
          type="datetime-local"
          placeholder="Start Time"
          onChange={(e) => handleFilterChange('start_time', e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="End Time"
          onChange={(e) => handleFilterChange('end_time', e.target.value)}
        />
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>User</th>
            <th>Admin</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {auditData.data.map(entry => (
            <tr key={entry.id}>
              <td>{new Date(entry.created_at).toLocaleString()}</td>
              <td>
                <span className={`event-type ${entry.event_type}`}>
                  {entry.event_type}
                </span>
              </td>
              <td>{entry.user_email || entry.user_id}</td>
              <td>{entry.admin_email || '-'}</td>
              <td>
                {entry.event_details && (
                  <pre>{JSON.stringify(entry.event_details, null, 2)}</pre>
                )}
                {entry.old_value && entry.new_value && (
                  <div className="value-change">
                    {entry.old_value} → {entry.new_value}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="audit-pagination">
        <span>
          Page {auditData.pagination.page} of {auditData.pagination.total_pages}
        </span>
        <button
          disabled={auditData.pagination.page <= 1}
          onClick={() => onFilterChange({ ...filters, page: auditData.pagination.page - 1 })}
        >
          Previous
        </button>
        <button
          disabled={auditData.pagination.page >= auditData.pagination.total_pages}
          onClick={() => onFilterChange({ ...filters, page: auditData.pagination.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### State Management Approach

The admin interface uses React's built-in state management with hooks for local state and context for shared state. The main page component maintains the overall application state and coordinates data flow between the child components.

The configuration state is stored in the parent component and passed down to the `RateLimitConfigPanel` as props. This approach ensures that configuration changes are immediately visible across all components and prevents inconsistent state between the config panel and other components that depend on configuration values.

The statistics state follows a similar pattern, with the parent component fetching and storing statistics data, then passing it to the `RateLimitStatsDashboard` component. Statistics are automatically refreshed every 60 seconds using a `setInterval` effect in the parent component.

The audit log state includes both the data and the current filter values. Filter state is maintained in the `RateLimitAuditLog` component and communicated to the parent component through callback functions, enabling the parent to trigger data refetches when filters change.

For global state that needs to be shared across multiple pages or components, consider using a React context provider. However, for this feature, the state is isolated to the admin page and does not require global state management solutions like Redux or Zustand.