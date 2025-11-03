-- =====================================================
-- Notifications Table Creation Script
-- =====================================================
-- This script creates the notifications table for in-app notifications
-- =====================================================

-- Drop table if it exists (for development/testing)
DROP TABLE IF EXISTS notifications;

-- Create the notifications table
CREATE TABLE notifications (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to user
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL, -- 'contract_ready', 'contract_signed', 'application_approved', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- Optional link to relevant page
    
    -- Status tracking
    read BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Index on user_id for user-specific queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Index on read status for unread notifications
CREATE INDEX idx_notifications_read ON notifications(read);

-- Index on type for filtering by notification type
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for user's unread notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- Index on created_at for sorting by newest first
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- Functions
-- =====================================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET read = true, updated_at = NOW()
    WHERE id = p_notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET read = true, updated_at = NOW()
    WHERE user_id = auth.uid() AND read = false;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Views
-- =====================================================

-- View for user's notifications with unread count
CREATE VIEW user_notifications_view AS
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.link,
    n.read,
    n.created_at,
    n.updated_at,
    CASE 
        WHEN n.read = false THEN 'unread'
        ELSE 'read'
    END as status
FROM notifications n
WHERE n.user_id = auth.uid()
ORDER BY n.created_at DESC;

-- =====================================================
-- Sample notifications (for testing)
-- =====================================================

-- Uncomment to create sample notifications for testing
/*
-- Sample contract ready notification
SELECT create_notification(
    auth.uid(),
    'contract_ready',
    'New Lease Contract Ready',
    'A tenant has signed a lease contract that requires your signature.',
    '/dashboard/landlord/contracts'
);

-- Sample contract signed notification
SELECT create_notification(
    auth.uid(),
    'contract_signed',
    'Lease Contract Fully Executed',
    'Your lease contract has been fully executed by both parties.',
    '/dashboard/contracts'
);
*/

-- =====================================================
-- Notifications setup completed successfully!
-- =====================================================
