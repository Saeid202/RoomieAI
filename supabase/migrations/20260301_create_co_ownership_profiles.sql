-- Migration: Create Co-Ownership Profiles Table
-- Description: Enables seekers to create general co-buyer matching profiles
-- Date: 2026-03-01

-- Create the co_ownership_profiles table
CREATE TABLE IF NOT EXISTS public.co_ownership_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Financial Capacity Section
    budget_min NUMERIC(12, 2),
    budget_max NUMERIC(12, 2),
    down_payment NUMERIC(12, 2),
    annual_income NUMERIC(12, 2),
    credit_score_range TEXT,
    
    -- Property Preferences Section
    property_types TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    min_bedrooms INTEGER,
    purchase_timeline TEXT,
    
    -- Co-Ownership Preferences Section
    ownership_split TEXT,
    living_arrangements TEXT[] DEFAULT '{}',
    co_ownership_purposes TEXT[] DEFAULT '{}',
    
    -- About You Section
    age_range TEXT,
    occupation TEXT,
    why_co_ownership TEXT,
    
    -- Metadata
    profile_completeness INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CHECK (budget_min >= 0),
    CHECK (budget_max >= 0),
    CHECK (budget_min <= budget_max),
    CHECK (down_payment >= 0),
    CHECK (annual_income >= 0),
    CHECK (min_bedrooms >= 0 AND min_bedrooms <= 10),
    CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    CHECK (LENGTH(why_co_ownership) <= 500),
    CHECK (credit_score_range IN ('below_600', '600-649', '650-699', '700-749', '750+') OR credit_score_range IS NULL),
    CHECK (purchase_timeline IN ('0-3 months', '3-6 months', '6-12 months', '12+ months') OR purchase_timeline IS NULL),
    CHECK (ownership_split IN ('50/50', '60/40', '70/30', 'flexible') OR ownership_split IS NULL),
    CHECK (age_range IN ('18-25', '26-35', '36-45', '46-55', '56+') OR age_range IS NULL)
);

-- Create indexes for performance
CREATE INDEX idx_co_ownership_profiles_user_id ON public.co_ownership_profiles(user_id);
CREATE INDEX idx_co_ownership_profiles_completeness ON public.co_ownership_profiles(profile_completeness);
CREATE INDEX idx_co_ownership_profiles_budget ON public.co_ownership_profiles(budget_min, budget_max);
CREATE INDEX idx_co_ownership_profiles_is_active ON public.co_ownership_profiles(is_active);
CREATE INDEX idx_co_ownership_profiles_locations ON public.co_ownership_profiles USING GIN(preferred_locations);
CREATE INDEX idx_co_ownership_profiles_property_types ON public.co_ownership_profiles USING GIN(property_types);

-- Enable Row Level Security
ALTER TABLE public.co_ownership_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own co-ownership profile"
    ON public.co_ownership_profiles
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_co_ownership_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER co_ownership_profiles_updated_at
    BEFORE UPDATE ON public.co_ownership_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_co_ownership_profiles_updated_at();

-- Add comment to table
COMMENT ON TABLE public.co_ownership_profiles IS 'Stores general co-buyer matching profiles for seekers, independent of specific properties';

-- Add comments to key columns
COMMENT ON COLUMN public.co_ownership_profiles.profile_completeness IS 'Calculated percentage (0-100) of profile completion';
COMMENT ON COLUMN public.co_ownership_profiles.is_active IS 'Whether the profile is active and visible for matching';
COMMENT ON COLUMN public.co_ownership_profiles.property_types IS 'Array of property types: condo, townhouse, detached, semi-detached, multi-unit';
COMMENT ON COLUMN public.co_ownership_profiles.living_arrangements IS 'Array of living arrangements: live_together, rent_out, investment_only';
COMMENT ON COLUMN public.co_ownership_profiles.co_ownership_purposes IS 'Array of purposes: primary_residence, investment, vacation_property';
