-- Create mortgage_profile_feedback table for broker-seeker communication
CREATE TABLE IF NOT EXISTS mortgage_profile_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES mortgage_profiles(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    section TEXT, -- Optional: which section of profile (e.g., 'employment', 'assets', 'credit', 'property', 'general')
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add review status to mortgage_profiles
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending_review' 
CHECK (review_status IN ('pending_review', 'under_review', 'feedback_sent', 'under_discussion', 'approved', 'rejected'));

-- Add last_reviewed_at timestamp
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

-- Add last_reviewed_by (broker who last reviewed)
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS last_reviewed_by UUID REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mortgage_feedback_profile ON mortgage_profile_feedback(profile_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_feedback_sender ON mortgage_profile_feedback(sender_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_feedback_created ON mortgage_profile_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_review_status ON mortgage_profiles(review_status);

-- Enable RLS
ALTER TABLE mortgage_profile_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mortgage_profile_feedback

-- Policy 1: Users can view feedback for their own profile
CREATE POLICY "Users can view feedback for their own profile"
ON mortgage_profile_feedback
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM mortgage_profiles WHERE user_id = auth.uid()
    )
);

-- Policy 2: Mortgage brokers can view feedback for profiles they have access to (with consent)
CREATE POLICY "Brokers can view feedback for consented profiles"
ON mortgage_profile_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'mortgage_broker'
    )
    AND profile_id IN (
        SELECT id FROM mortgage_profiles WHERE broker_consent = TRUE
    )
);

-- Policy 3: Users can insert feedback for their own profile
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
                WHERE user_profiles.user_id = auth.uid() 
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mortgage_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_mortgage_feedback_timestamp
BEFORE UPDATE ON mortgage_profile_feedback
FOR EACH ROW
EXECUTE FUNCTION update_mortgage_feedback_updated_at();

-- Function to update profile review status when feedback is sent
CREATE OR REPLACE FUNCTION update_profile_review_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile's review status to 'feedback_sent' when broker sends message
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = NEW.sender_id 
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

-- Trigger to auto-update review status
CREATE TRIGGER update_review_status_on_feedback
AFTER INSERT ON mortgage_profile_feedback
FOR EACH ROW
EXECUTE FUNCTION update_profile_review_status();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON mortgage_profile_feedback TO authenticated;
GRANT USAGE ON SEQUENCE mortgage_profile_feedback_id_seq TO authenticated;
