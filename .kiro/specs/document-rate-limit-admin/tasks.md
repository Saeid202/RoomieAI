# Implementation Plan: Document Rate Limit Admin Feature

## Overview

This implementation plan breaks down the Document Rate Limit Admin feature into four phases: Database Setup, Edge Functions, Frontend Components, and Integration & Testing. The feature enables administrators to configure, monitor, and manage document processing rate limits without code deployments.

## Tasks

### Phase 1: Database Setup

- [x] 1.1 Create rate_limit_config table
  - Create table with key-value pattern for flexible configuration
  - Add indexes on config_key for fast lookups
  - Enable RLS with super_admin policy
  - _Requirements: 8.1, 8.2_

- [x] 1.2 Create rate_limit_audit table
  - Create table with event_type, user_id, admin_user_id, document_id, property_id, event_details, old_value, new_value
  - Add indexes on event_type, user_id, created_at, admin_user_id for efficient queries
  - Enable RLS with admin view policy and system insert policy
  - Add CHECK constraint for valid event_type values
  - _Requirements: 1.3, 2.3, 3.4, 5.3, 6.1, 6.3, 6.6_

- [x] 1.3 Seed initial configuration values
  - Insert global_enabled = 'true'
  - Insert max_requests = '5'
  - Insert time_window_minutes = '60'
  - Insert cleanup_after_days = '90'
  - Use ON CONFLICT DO NOTHING to prevent duplicates
  - _Requirements: 8.1, 8.2_

- [x] 1.4 Create get_rate_limit_config() RPC function
  - Return all configuration as JSON object aggregating config_key/config_value pairs
  - Use SECURITY DEFINER to ensure proper authorization
  - _Requirements: 8.1, 8.2_

- [x] 1.5 Create update_rate_limit_config() RPC function
  - Accept config_key, config_value, admin_user_id parameters
  - Validate config_key exists before update
  - Store old_value for audit trail
  - Create audit log entry on successful update
  - Return JSON with success status and old/new values
  - _Requirements: 1.3, 2.3, 3.4, 5.3, 6.6_

- [x] 1.6 Create get_rate_limit_stats() RPC function
  - Read current config values for max_requests and time_window_minutes
  - Aggregate top 20 users by request count in current time window
  - Identify users who hit the rate limit
  - Calculate usage distribution across percentage buckets
  - Return total request count
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 1.7 Create get_rate_limit_audit_log() RPC function
  - Accept optional filters: user_id, event_type, start_time, end_time
  - Support pagination with page and page_size parameters
  - Join with auth.users for email lookups
  - Return data array with pagination metadata
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 1.8 Create reset_user_rate_limit() RPC function
  - Accept user_id and admin_user_id parameters
  - Delete all document_processing_requests records for the user
  - Create audit log entry with deleted_count
  - Return success status and deleted_count
  - _Requirements: 5.1, 5.2, 5.3, 5.6_

- [x] 1.9 Update check_document_rate_limit() RPC function
  - Read global_enabled, max_requests, time_window_minutes from rate_limit_config
  - Return early with allowed=true when global_enabled is false
  - Use config values for rate limit calculations
  - Maintain atomic check behavior with existing COUNT query
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.4_

- [x] 1.10 Add RLS policies for document_processing_requests
  - Create policy allowing super_admin to view all records
  - Create policy allowing users to view their own records
  - _Requirements: 4.6, 6.3_

- [x] 1.11 Checkpoint - Verify database setup
  - Ensure all tables and functions are created without errors
  - Verify RLS policies are working correctly
  - Test basic RPC function calls
  - Ask the user if questions arise.

### Phase 2: Edge Functions

- [x] 2.1 Create admin-rate-limit-config edge function
  - Set up Supabase edge function project structure
  - Configure CORS headers for admin panel access
  - Implement authentication verification with Bearer token
  - Implement super_admin role authorization check
  - Route GET and POST requests to appropriate handlers
  - Add error handling with proper status codes
  - _Requirements: 1.5, 4.1, 5.4, 6.5_

- [x] 2.2 Implement GET /config handler
  - Call get_rate_limit_config() RPC function
  - Return configuration as JSON response
  - Handle RPC errors gracefully
  - _Requirements: 1.4, 2.5, 3.2, 8.3_

- [x] 2.3 Implement GET /stats handler
  - Call get_rate_limit_stats() RPC function
  - Return statistics as JSON response
  - Handle RPC errors gracefully
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 2.4 Implement GET /audit handler
  - Parse query parameters: user_id, event_type, start_time, end_time, page, page_size
  - Call get_rate_limit_audit_log() RPC function with parameters
  - Return audit data with pagination as JSON
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 2.5 Implement POST /update_config handler
  - Validate config_key against allowed keys: global_enabled, max_requests, time_window_minutes, cleanup_after_days
  - Validate max_requests is integer 1-1000
  - Validate time_window_minutes is integer 1-1440
  - Validate global_enabled is 'true' or 'false'
  - Call update_rate_limit_config() RPC function
  - Return success/error response
  - _Requirements: 1.4, 1.5, 2.1, 2.4, 3.1, 3.2, 3.4_

- [x] 2.6 Implement POST /reset_user handler
  - Validate user_id is provided
  - Call reset_user_rate_limit() RPC function
  - Return success response with deleted_count
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [x] 2.7 Implement POST /bulk_reset_users handler
  - Validate user_ids is non-empty array
  - Process users in batches of 100 to avoid timeouts
  - Call reset_user_rate_limit() for each user
  - Return results array with success/failure per user
  - _Requirements: 5.5, Edge Case 7_

- [x] 2.8 Implement POST /export_audit handler
  - Accept start_time, end_time, event_type filters
  - Call get_rate_limit_audit_log() with large page_size
  - Convert JSON data to CSV format
  - Return CSV with proper Content-Disposition header
  - _Requirements: 6.5_

- [x] 2.9 Add CSV conversion utility
  - Implement convertToCSV function
  - Handle null/undefined values
  - Escape quotes and special characters
  - _Requirements: 6.5_

- [x] 2.10 Checkpoint - Verify edge function
  - Test all GET and POST handlers with valid inputs
  - Test authorization rejection for non-super_admin users
  - Test error handling for invalid inputs
  - Ask the user if questions arise.

### Phase 3: Frontend Components

- [x] 3.1 Create RateLimitConfigPanel component
  - Create TypeScript interface for RateLimitConfig props
  - Implement local state for edited values
  - Add change detection with hasChanges flag
  - Implement Save and Cancel buttons
  - Add checkbox for global_enabled toggle
  - Add number input for max_requests with 1-1000 validation
  - Add number input for time_window_minutes with 1-1440 validation
  - Display current configuration with labels
  - _Requirements: 1.4, 1.5, 2.1, 2.4, 2.5, 3.1, 3.2, 3.5_

- [x] 3.2 Create RateLimitStatsDashboard component
  - Create TypeScript interface for RateLimitStats props
  - Implement stats summary cards (total requests, max requests, time window)
  - Implement usage distribution visualization with progress bars
  - Implement top users table with email, request count
  - Add checkbox selection for bulk operations
  - Add individual user reset button
  - Add bulk reset button for selected users
  - Implement refresh button with loading state
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.5_

- [x] 3.3 Create RateLimitAuditLog component
  - Create TypeScript interface for AuditLogResponse and AuditFilters
  - Implement filter controls: user_id text input, event_type select, start/end datetime inputs
  - Implement audit table with columns: timestamp, event type, user, admin, details
  - Add event type badges with styling
  - Show value changes for config_change events
  - Implement pagination controls (Previous/Next buttons, page indicator)
  - Add Export CSV button
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 3.4 Create admin page at /dashboard/admin/rate-limit-management
  - Create page component with tabs for Config, Stats, Audit
  - Implement state for config, stats, and audit data
  - Implement auto-refresh for stats every 60 seconds
  - Add loading states for all data fetches
  - Implement error handling and display
  - Add API service functions for edge function calls
  - _Requirements: 1.4, 1.5, 4.1, 4.7, 5.1, 6.1_

- [x] 3.5 Add navigation to admin page
  - Add menu item in admin navigation sidebar
  - Add route configuration for /dashboard/admin/rate-limit-management
  - Add role-based access control (super_admin only)
  - _Requirements: 1.5, 4.1_

- [x] 3.6 Checkpoint - Verify frontend components
  - Test all component interactions
  - Verify data fetching and display
  - Test filter and pagination functionality
  - Ask the user if questions arise.

### Phase 4: Integration & Testing

- [x] 4.1 Update existing document processing edge functions
  - Identify all edge functions that call check_document_rate_limit()
  - Update to use new config-aware check_document_rate_limit()
  - Ensure record_document_request() continues to work correctly
  - Test rate limit enforcement with various configurations
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3_

- [x] 4.2 Write property test for Configuration Persistence
  - **Property 1: Configuration Persistence**
  - **Validates: Requirements 8.1, 8.2**
  - Test that any config value written can be read back identically
  - _Requirements: 8.1, 8.2_

- [x] 4.3 Write property test for Rate Limit Enforcement Consistency
  - **Property 2: Rate Limit Enforcement Consistency**
  - **Validates: Requirements 7.1, 7.2, Edge Case 2**
  - Test that rate limiter applies same config throughout request evaluation
  - _Requirements: 7.1, 7.2, Edge Case 2_

- [x] 4.4 Write property test for Audit Log Completeness
  - **Property 3: Audit Log Completeness**
  - **Validates: Requirements 1.3, 2.3, 3.4, 5.3, 6.6**
  - Test that each administrative action creates exactly one audit entry
  - _Requirements: 1.3, 2.3, 3.4, 5.3, 6.6_

- [x] 4.5 Write property test for User Reset Effectiveness
  - **Property 4: User Reset Effectiveness**
  - **Validates: Requirements 5.1, 5.6**
  - Test that user request count is zero immediately after reset
  - _Requirements: 5.1, 5.6_

- [x] 4.6 Write property test for Atomic Rate Limit Check
  - **Property 5: Atomic Rate Limit Check**
  - **Validates: Requirements 7.4, Edge Case 1**
  - Test that concurrent requests from same user are counted exactly once
  - _Requirements: 7.4, Edge Case 1_

- [x] 4.7 Write unit tests for configuration validation
  - Test max_requests validation (1-1000)
  - Test time_window_minutes validation (1-1440)
  - Test global_enabled validation (true/false)
  - Test invalid config_key rejection
  - _Requirements: 2.4, 3.1, 3.2_

- [x] 4.8 Write unit tests for audit log filtering
  - Test filtering by user_id
  - Test filtering by event_type
  - Test filtering by date range
  - Test pagination calculations
  - _Requirements: 6.2, 6.4_

- [x] 4.9 Write unit tests for user reset functionality
  - Test single user reset
  - Test bulk user reset
  - Test reset creates audit entry
  - Test reset clears request records
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

- [x] 4.10 Test rate limiting with dynamic configuration
  - Test global_enabled toggle affects rate limiting
  - Test max_requests change is applied immediately
  - Test time_window change affects rolling window calculation
  - Test zero max_requests blocks all requests
  - _Requirements: 1.1, 1.2, 2.2, 3.3, Edge Case 3_

- [x] 4.11 Test admin operations
  - Test config changes are logged in audit
  - Test user resets are logged in audit
  - Test bulk operations complete without timeout
  - Test CSV export format is correct
  - _Requirements: 1.3, 2.3, 3.4, 5.3, 5.5, 6.5, 6.6_

- [x] 4.12 Test audit logging
  - Test request_allowed events are logged
  - Test request_blocked events are logged
  - Test config_change events include old/new values
  - Test user_reset events include deleted_count
  - Test audit log retention configuration
  - _Requirements: 1.3, 2.3, 3.4, 5.3, 6.1, 6.3, 6.6, 6.7_

- [x] 4.13 Test edge cases
  - Test concurrent requests from same user (race condition prevention)
  - Test configuration changes mid-request
  - Test very short time window behavior
  - Test bulk operations timeout handling
  - _Requirements: Edge Case 1, Edge Case 2, Edge Case 4, Edge Case 7_

- [x] 4.14 Final checkpoint - Ensure all tests pass
  - Run all property-based tests
  - Run all unit tests
  - Verify integration tests pass
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (none in this plan - all tasks are required)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each phase
- Property tests validate universal correctness properties across all valid inputs
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript for edge functions and frontend components
- All admin operations require super_admin role authorization
- Audit logging captures all configuration changes and administrative actions