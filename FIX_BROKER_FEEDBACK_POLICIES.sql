-- ============================================
-- FIX BROKER FEEDBACK RLS POLICIES
-- This fixes the foreign key relationship error
-- ============================================

-- Drop all existing policies on mortgage_profile_feedback
DROP POLICY IF EXISTS "Users can view feedback for their own profile" ON mortgage_profile_feedback;
DROP POLICY IF EXISTS "Brokers can view feedback for consented profiles" ON mortgage_profile_feedback;
DROP POLICY IF EXISTS "Users can send feedback for their own profile" ON mortgage_profile_feedback;
DROP POLICY IF EXISTS "Users can mark messages as read" ON mortgage_profile_feedback;

-- Recreate policies with correct column references

-- Policy 1: Users can view feedback for their own profile
CREATE POLICY "Users can view feedback for their own profile"
ON mortgage_profile_feedback
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM mortgage_profiles WHERE user_id = auth.uid()
    )
);

-- Policy 2: Mortgage brokers can view feedback for profiles with consent
-- FIXED: user_profiles.id is the primary key (UUID), not user_profiles.user_id
CREATE POLICY "Brokers can view feedback for consented profiles"
ON mortgage_profile_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'mortgage_broker'
    )
    AND profile_id IN (
        SELECT id FROM mortgage_profiles WHERE broker_consent = TRUE
    )
);

-- Policy 3: Users can insert feedback for their own profile
-- FIXED: user_profiles.id is the primary key (UUID), not user_profiles.user_id
CREATE POLICY "Users can send feedback for their own profile"
ON mortgage_profile_feedback
FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND (
        -- User owns the profile
        profile_id IN (
            SELECT id FROM mortgage_profiles WHERE user_id = auth.uid()
        )
        OR
        -- User is a broker and profile has consent
        (
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role = 'mortgage_broker'
            )
            AND profile_id IN (
                SELECT id FROM mortgage_profiles WHERE broker_consent = TRUE
            )
        )
    )
);

-- Policy 4: Users can update read status on their own messages
CREATE POLICY "Users can mark messages as read"
ON mortgage_profile_feedback
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM mortgage_profiles WHERE user_id = auth.uid()
    )
    OR
    sender_id = auth.uid()
);

-- Also fix the trigger function
CREATE OR REPLACE FUNCTION update_profile_review_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile's review status to 'feedback_sent' when broker sends message
    -- FIXED: user_profiles.id is the primary key
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = NEW.sender_id 
        AND user_profiles.role = 'mortgage_broker'
    ) THEN
        UPDATE mortgage_profiles 
        SET 
            review_status = 'feedback_sent',
            last_reviewed_at = NOW(),
            last_reviewed_by = NEW.sender_id
        WHERE id = NEW.profile_id;
    ELSE
        -- If seeker responds, change to 'under_discussion'
        UPDATE mortgage_profiles 
        SET review_status = 'under_discussion'
        WHERE id = NEW.profile_id AND review_status = 'feedback_sent';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Broker Feedback RLS policies fixed successfully!';
    RAISE NOTICE 'All policies now use user_profiles.id (not user_profiles.user_id)';
END $$;
