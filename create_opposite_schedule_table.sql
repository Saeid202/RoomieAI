-- =====================================================
-- Opposite Schedule Profiles Table Creation Script
-- =====================================================
-- This script creates the opposite_schedule_profiles table for the Opposite Schedule Room Sharing form
-- =====================================================

-- Drop table if it exists (for development/testing)
DROP TABLE IF EXISTS opposite_schedule_profiles;

-- Create the opposite_schedule_profiles table
CREATE TABLE opposite_schedule_profiles (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to user
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User's Work Schedule (Required fields)
    work_schedule VARCHAR(100) NOT NULL, -- e.g., "9-5 PM (Day Shift)", "Night Shift (11 PM - 7 AM)"
    occupation VARCHAR(100), -- e.g., "Software Engineer", "Nurse", "Teacher"
    nationality VARCHAR(50), -- e.g., "Canadian", "American", "British"
    
    -- Property Preferences (Required)
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN (
        'studio',
        'one-bedroom', 
        'two-bedroom',
        'house',
        'apartment',
        'basement',
        'no-preference'
    )),
    
    -- What They're Looking For (Required)
    preferred_schedule VARCHAR(100) NOT NULL, -- e.g., "Night Shift (11 PM - 7 AM)", "9-5 PM (Day Shift)"
    preferred_nationality VARCHAR(50), -- e.g., "Canadian", "Any", "American"
    food_restrictions TEXT, -- e.g., "Vegetarian", "Halal", "No pork", "Gluten-free"
    
    -- Additional Preferences (Optional)
    additional_notes TEXT, -- Any other preferences or requirements
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_opposite_schedule UNIQUE (user_id),
    CONSTRAINT valid_work_schedule CHECK (work_schedule IN (
        '9-5 PM (Day Shift)',
        'Night Shift (11 PM - 7 AM)',
        'Evening Shift (3 PM - 11 PM)',
        'Morning Shift (6 AM - 2 PM)',
        'Rotating Schedule',
        'Weekend Work',
        'Flexible Hours',
        'Part-time',
        'Other'
    )),
    CONSTRAINT valid_preferred_schedule CHECK (preferred_schedule IN (
        '9-5 PM (Day Shift)',
        'Night Shift (11 PM - 7 AM)',
        'Evening Shift (3 PM - 11 PM)',
        'Morning Shift (6 AM - 2 PM)',
        'Rotating Schedule',
        'Weekend Work',
        'Flexible Hours',
        'Part-time',
        'Other'
    )),
    CONSTRAINT valid_nationality CHECK (nationality IN (
        'Canadian', 'American', 'British', 'Australian', 'German', 'French', 'Italian', 'Spanish',
        'Portuguese', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
        'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish', 'Russian', 'Ukrainian', 'Chinese',
        'Japanese', 'Korean', 'Vietnamese', 'Thai', 'Filipino', 'Indian', 'Pakistani', 'Bangladeshi',
        'Sri Lankan', 'Nepalese', 'Afghan', 'Iranian', 'Iraqi', 'Lebanese', 'Jordanian', 'Egyptian',
        'Moroccan', 'Tunisian', 'Algerian', 'Nigerian', 'Kenyan', 'South African', 'Brazilian',
        'Argentinian', 'Chilean', 'Mexican', 'Colombian', 'Peruvian', 'Venezuelan', 'Other'
    )),
    CONSTRAINT valid_preferred_nationality CHECK (preferred_nationality IN (
        'Canadian', 'American', 'British', 'Australian', 'German', 'French', 'Italian', 'Spanish',
        'Portuguese', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
        'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Turkish', 'Russian', 'Ukrainian', 'Chinese',
        'Japanese', 'Korean', 'Vietnamese', 'Thai', 'Filipino', 'Indian', 'Pakistani', 'Bangladeshi',
        'Sri Lankan', 'Nepalese', 'Afghan', 'Iranian', 'Iraqi', 'Lebanese', 'Jordanian', 'Egyptian',
        'Moroccan', 'Tunisian', 'Algerian', 'Nigerian', 'Kenyan', 'South African', 'Brazilian',
        'Argentinian', 'Chilean', 'Mexican', 'Colombian', 'Peruvian', 'Venezuelan', 'Other'
    ))
);

-- =====================================================
-- Indexes
-- =====================================================

-- Index on user_id for user-specific queries
CREATE INDEX idx_opposite_schedule_profiles_user_id ON opposite_schedule_profiles(user_id);

-- Index on work_schedule for matching queries
CREATE INDEX idx_opposite_schedule_profiles_work_schedule ON opposite_schedule_profiles(work_schedule);

-- Index on preferred_schedule for matching queries
CREATE INDEX idx_opposite_schedule_profiles_preferred_schedule ON opposite_schedule_profiles(preferred_schedule);

-- Index on property_type for filtering
CREATE INDEX idx_opposite_schedule_profiles_property_type ON opposite_schedule_profiles(property_type);

-- Index on nationality for matching
CREATE INDEX idx_opposite_schedule_profiles_nationality ON opposite_schedule_profiles(nationality);

-- Index on preferred_nationality for matching
CREATE INDEX idx_opposite_schedule_profiles_preferred_nationality ON opposite_schedule_profiles(preferred_nationality);

-- Composite index for efficient matching queries
CREATE INDEX idx_opposite_schedule_profiles_matching ON opposite_schedule_profiles(
    work_schedule, 
    preferred_schedule, 
    property_type,
    nationality,
    preferred_nationality
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE opposite_schedule_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own opposite schedule profile" ON opposite_schedule_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can create their own opposite schedule profile" ON opposite_schedule_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own opposite schedule profile" ON opposite_schedule_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own opposite schedule profile" ON opposite_schedule_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users can view other profiles for matching (with restrictions)
CREATE POLICY "Users can view other profiles for matching" ON opposite_schedule_profiles
    FOR SELECT USING (
        -- Exclude their own profile
        auth.uid() != user_id
    );

-- =====================================================
-- Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_opposite_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_opposite_schedule_updated_at
    BEFORE UPDATE ON opposite_schedule_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_opposite_schedule_updated_at();

-- Function to calculate compatibility score between two profiles
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
    profile1_user_id UUID,
    profile2_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    p1 RECORD;
    p2 RECORD;
    score INTEGER := 0;
BEGIN
    -- Get both profiles
    SELECT * INTO p1 FROM opposite_schedule_profiles WHERE user_id = profile1_user_id;
    SELECT * INTO p2 FROM opposite_schedule_profiles WHERE user_id = profile2_user_id;
    
    -- Check if both profiles exist
    IF p1 IS NULL OR p2 IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Schedule compatibility (50 points max)
    IF p1.work_schedule = p2.preferred_schedule AND p2.work_schedule = p1.preferred_schedule THEN
        score := score + 50; -- Perfect match
    ELSIF p1.work_schedule = p2.preferred_schedule OR p2.work_schedule = p1.preferred_schedule THEN
        score := score + 25; -- Partial match
    END IF;
    
    -- Property type match (30 points max)
    IF p1.property_type = p2.property_type THEN
        score := score + 30;
    ELSIF p1.property_type = 'no-preference' OR p2.property_type = 'no-preference' THEN
        score := score + 15;
    END IF;
    
    -- Nationality compatibility (20 points max)
    IF p1.nationality = p2.preferred_nationality AND p2.nationality = p1.preferred_nationality THEN
        score := score + 20;
    ELSIF p1.nationality = p2.preferred_nationality OR p2.nationality = p1.preferred_nationality THEN
        score := score + 10;
    ELSIF p1.preferred_nationality = 'Any' OR p2.preferred_nationality = 'Any' THEN
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Views
-- =====================================================

-- View for user's own profile with formatted data
CREATE VIEW user_opposite_schedule_profile AS
SELECT 
    id,
    user_id,
    work_schedule,
    occupation,
    nationality,
    property_type,
    preferred_schedule,
    preferred_nationality,
    food_restrictions,
    additional_notes,
    created_at,
    updated_at,
    -- Computed fields
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 as days_since_created
FROM opposite_schedule_profiles
WHERE user_id = auth.uid();

-- View for potential matches with compatibility scores
CREATE VIEW potential_opposite_schedule_matches AS
SELECT 
    p.id,
    p.user_id,
    p.work_schedule,
    p.occupation,
    p.nationality,
    p.property_type,
    p.preferred_schedule,
    p.preferred_nationality,
    p.food_restrictions,
    p.additional_notes,
    p.created_at,
    -- User info (limited for privacy)
    u.email,
    -- Computed fields
    calculate_compatibility_score(auth.uid(), p.user_id) as compatibility_score
FROM opposite_schedule_profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE 
    p.user_id != auth.uid()
    AND EXISTS (
        SELECT 1 FROM opposite_schedule_profiles current_user_profile
        WHERE current_user_profile.user_id = auth.uid()
    );

-- =====================================================
-- Opposite Schedule Profiles table setup completed successfully!
-- =====================================================
