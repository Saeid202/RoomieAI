-- Fix Notification RLS Bypass
-- Issue: Any authenticated user can send notifications to any user (phishing risk)

-- Drop the insecure policy that allows any user to insert notifications
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Only service_role (backend) can create notifications
-- Users can only SELECT and UPDATE their own notifications
CREATE POLICY "Service role can create notifications" ON notifications
    FOR INSERT TO service_role WITH CHECK (true);

-- Verify existing policies are secure:
-- "Users can view their own notifications" - uses auth.uid() = user_id ✓
-- "Users can update their own notifications" - uses auth.uid() = user_id ✓