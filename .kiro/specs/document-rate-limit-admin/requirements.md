# Document Rate Limit Admin Feature Requirements

## Introduction

This document defines the requirements for the Document Rate Limit Admin feature, which provides administrative controls for managing the document processing rate limiting system. The rate limiter currently restricts users to 5 document processing requests per hour to prevent Gemini API quota exhaustion. This feature enables administrators to configure, monitor, and manage rate limits without requiring code deployments.

## Glossary

- **Rate_Limiter**: The system component that enforces document processing rate limits
- **Rate_Limit_Config**: Database table storing configurable rate limiting parameters
- **Rate_Limit_Stats**: Aggregated statistics about rate limit usage per user
- **Audit_Log**: Record of all document processing requests for compliance and monitoring
- **Admin_Panel**: The user interface for administrators to manage rate limits
- **Time_Window**: Configurable duration for measuring request counts (e.g., 1 hour)
- **Request_Count**: Number of document processing requests within a time window
- **Max_Requests**: Configurable maximum allowed requests per user within a time window
- **Global_Flag**: Boolean setting to enable or disable rate limiting entirely

## Requirements

### Requirement 1: Global Rate Limit Enable/Disable

**User Story:** As a system administrator, I want to enable or disable rate limiting globally, so that I can temporarily bypass rate limits during high-volume processing periods or emergencies.

#### Acceptance Criteria

1. WHERE the Global_Flag is set to disabled, THE Rate_Limiter SHALL allow all document processing requests without checking limits.
2. WHERE the Global_Flag is set to enabled, THE Rate_Limiter SHALL enforce rate limits as configured.
3. WHEN an administrator toggles the Global_Flag, THE System SHALL log the change in the Audit_Log with timestamp and admin user ID.
4. THE Admin_Panel SHALL display the current Global_Flag status prominently.
5. THE Admin_Panel SHALL require super_admin role to modify the Global_Flag.

### Requirement 2: Configure Rate Limit Count

**User Story:** As a system administrator, I want to adjust the maximum number of documents a user can process, so that I can balance API quota usage with user productivity.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow administrators to set Max_Requests to any integer value between 1 and 1000.
2. WHEN Max_Requests is updated, THE Rate_Limiter SHALL use the new value for all subsequent rate limit checks.
3. WHEN Max_Requests is updated, THE System SHALL log the change in the Audit_Log with old and new values.
4. THE Admin_Panel SHALL validate that Max_Requests is a positive integer.
5. THE Admin_Panel SHALL display the current Max_Requests value with a clear label indicating "documents per time window".

### Requirement 3: Configure Time Window

**User Story:** As a system administrator, I want to adjust the time window for rate limiting, so that I can implement different rate limiting strategies (e.g., stricter limits with shorter windows).

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow administrators to set Time_Window to any value between 1 minute and 24 hours.
2. THE Admin_Panel SHALL support time window configuration in minutes, hours, or days.
3. WHEN Time_Window is updated, THE Rate_Limiter SHALL use the new window for all subsequent rate limit checks.
4. WHEN Time_Window is updated, THE System SHALL log the change in the Audit_Log with old and new values.
5. THE Rate_Limiter SHALL calculate request counts using the updated Time_Window immediately after configuration change.

### Requirement 4: View Rate Limit Statistics

**User Story:** As a system administrator, I want to view rate limit usage statistics, so that I can identify users approaching limits and monitor overall system usage.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a dashboard showing current rate limit statistics.
2. THE Dashboard SHALL show the top 20 users by request count in the current time window.
3. THE Dashboard SHALL show users who have hit the rate limit in the current time window.
4. THE Dashboard SHALL display total request count for the current time window.
5. THE Dashboard SHALL display the percentage of users at each usage level (0-25%, 26-50%, 51-75%, 76-99%, 100%).
6. WHEN an administrator selects a specific user, THE Admin_Panel SHALL show that user's request history for the past 24 hours.
7. THE Statistics SHALL refresh automatically every 60 seconds or when manually refreshed.

### Requirement 5: Reset User Rate Limits

**User Story:** As a system administrator, I want to reset rate limits for specific users, so that I can unblock users who legitimately need to process more documents.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow administrators to select a user and reset their rate limit counter.
2. WHEN a user's rate limit is reset, THE System SHALL delete all document_processing_requests records for that user.
3. WHEN a user's rate limit is reset, THE System SHALL log the action in the Audit_Log with admin user ID and affected user ID.
4. THE Admin_Panel SHALL require confirmation before resetting a user's rate limit.
5. THE Admin_Panel SHALL support bulk reset for multiple users selected from the statistics view.
6. AFTER reset, THE selected user SHALL have zero requests counted toward their rate limit.

### Requirement 6: View Audit Log

**User Story:** As a system administrator or compliance officer, I want to view an audit log of all document processing requests, so that I can investigate issues and demonstrate compliance with rate limiting policies.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display an Audit_Log showing all document processing requests.
2. THE Audit_Log SHALL be filterable by user_id, date range, and request status (allowed/blocked).
3. THE Audit_Log SHALL show the timestamp, user_id, document_id, property_id, and result (allowed/blocked) for each request.
4. THE Audit_Log SHALL support pagination with at least 100 records per page.
5. THE Audit_Log SHALL be exportable to CSV format.
6. THE Audit_Log SHALL include administrative actions (config changes, resets) with admin user ID.
7. THE Audit_Log SHALL retain records for a minimum of 90 days.

### Requirement 7: Real-time Rate Limit Enforcement

**User Story:** As a system architect, I want the rate limiter to enforce limits in real-time, so that quota exhaustion is prevented consistently.

#### Acceptance Criteria

1. WHEN a document processing request is initiated, THE Rate_Limiter SHALL check the rate limit before processing.
2. WHERE the request would exceed the limit, THE Rate_Limiter SHALL return a rate limit exceeded error immediately.
3. THE Rate_Limiter SHALL complete rate limit checks within 50ms of request initiation.
4. THE check_document_rate_limit() function SHALL be atomic to prevent race conditions.

### Requirement 8: Configuration Persistence

**User Story:** As a system architect, I want rate limit configuration to persist across system restarts, so that settings are not lost during deployments or outages.

#### Acceptance Criteria

1. THE Rate_Limit_Config SHALL be stored in a dedicated database table.
2. THE System SHALL load configuration from the database on startup.
3. THE Admin_Panel SHALL display the last modified timestamp for each configuration value.
4. THE System SHALL maintain configuration history for rollback purposes.

## Technical Constraints

1. The rate limiter must not add more than 100ms latency to document processing requests.
2. The document_processing_requests table must support at least 1 million records without performance degradation.
3. Rate limit checks must be atomic to prevent race conditions from concurrent requests.
4. The admin interface must be accessible only to users with super_admin role.
5. All admin actions must be logged with user ID, timestamp, and action details.
6. The system must handle database connection failures gracefully without blocking legitimate requests.

## Edge Cases

1. **Concurrent Requests**: Multiple requests from the same user arriving simultaneously must be counted correctly without race conditions.
2. **Configuration Changes Mid-Request**: Requests in progress when configuration changes must complete using the configuration active at their start time.
3. **Zero Max_Requests**: Setting Max_Requests to 0 should immediately block all requests.
4. **Very Short Time Window**: Time windows under 1 minute may cause rapid table growth; consider cleanup strategy.
5. **User Deletion**: When a user is deleted, their document_processing_requests records should be cascade deleted.
6. **System Clock Changes**: Time-based calculations should use database time, not client time, to prevent manipulation.
7. **Bulk Operations Timeout**: Bulk rate limit resets for many users should use batch processing to avoid database timeouts.
8. **Audit Log Overflow**: Implement log rotation or archival for audit logs exceeding storage limits.

## Dependencies

- Existing document_processing_requests table
- Existing check_document_rate_limit() RPC function
- Existing record_document_request() RPC function
- Supabase authentication and authorization system
- Admin panel infrastructure (existing or to be created)

## Out of Scope

- Rate limiting for non-document processing endpoints
- Per-property rate limiting
- User-facing rate limit notifications
- Automatic rate limit adjustment based on API quota usage
- Integration with external monitoring systems (Datadog, etc.)