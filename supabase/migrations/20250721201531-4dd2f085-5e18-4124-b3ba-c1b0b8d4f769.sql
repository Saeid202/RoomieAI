
-- Create enum for move timeline status
CREATE TYPE move_timeline_status AS ENUM ('planning', 'active', 'completed', 'cancelled');

-- Create enum for housing search status
CREATE TYPE housing_search_status AS ENUM ('not_started', 'actively_searching', 'applications_submitted', 'offer_received', 'signed_lease');

-- Create plan_ahead_profiles table
CREATE TABLE public.plan_ahead_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Move Timeline
  planned_move_date DATE NOT NULL,
  flexible_move_date BOOLEAN DEFAULT false,
  flexibility_weeks INTEGER DEFAULT 0,
  timeline_status move_timeline_status DEFAULT 'planning',
  
  -- Current Status
  current_city TEXT,
  current_state TEXT,
  current_country TEXT DEFAULT 'United States',
  
  -- Target Location
  target_cities TEXT[] NOT NULL,
  target_states TEXT[] NOT NULL,
  willing_to_relocate_anywhere BOOLEAN DEFAULT false,
  max_distance_from_target INTEGER, -- in miles
  
  -- Housing Preferences
  housing_search_status housing_search_status DEFAULT 'not_started',
  budget_range INTEGER[] NOT NULL, -- [min, max]
  preferred_housing_types TEXT[] NOT NULL,
  preferred_living_arrangements TEXT[] NOT NULL,
  room_type_preference TEXT,
  lease_duration_preference TEXT,
  
  -- Roommate Preferences
  looking_for_roommate BOOLEAN DEFAULT true,
  max_roommates INTEGER DEFAULT 3,
  age_range_preference INTEGER[] DEFAULT ARRAY[18, 65],
  gender_preference TEXT[],
  lifestyle_compatibility TEXT[],
  shared_interests TEXT[],
  
  -- Lifestyle Information
  work_situation TEXT,
  school_situation TEXT,
  daily_schedule TEXT,
  social_level TEXT,
  cleanliness_level INTEGER DEFAULT 5,
  noise_tolerance TEXT,
  guest_policy TEXT,
  
  -- Requirements & Restrictions
  special_requirements TEXT[],
  accessibility_needs TEXT[],
  pet_situation TEXT,
  pet_preferences TEXT,
  smoking_preference TEXT,
  substance_policies TEXT[],
  
  -- Communication & Matching
  communication_frequency TEXT DEFAULT 'weekly',
  match_notification_preferences TEXT[] DEFAULT ARRAY['email', 'in_app'],
  auto_match_enabled BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public',
  
  -- Additional Information
  move_reason TEXT,
  prior_roommate_experience TEXT,
  additional_notes TEXT,
  
  -- Profile Management
  is_active BOOLEAN DEFAULT true,
  profile_completion_percentage INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_budget_range CHECK (array_length(budget_range, 1) = 2 AND budget_range[1] <= budget_range[2]),
  CONSTRAINT valid_age_range CHECK (array_length(age_range_preference, 1) = 2 AND age_range_preference[1] <= age_range_preference[2]),
  CONSTRAINT valid_cleanliness_level CHECK (cleanliness_level >= 1 AND cleanliness_level <= 10),
  CONSTRAINT valid_flexibility_weeks CHECK (flexibility_weeks >= 0 AND flexibility_weeks <= 52),
  CONSTRAINT future_move_date CHECK (planned_move_date >= CURRENT_DATE)
);

-- Enable RLS
ALTER TABLE public.plan_ahead_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own plan ahead profile"
  ON public.plan_ahead_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan ahead profile"
  ON public.plan_ahead_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan ahead profile"
  ON public.plan_ahead_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan ahead profile"
  ON public.plan_ahead_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow authenticated users to view other active profiles for matching
CREATE POLICY "Users can view other active plan ahead profiles for matching"
  ON public.plan_ahead_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_active = true 
    AND profile_visibility = 'public'
    AND user_id != auth.uid()
  );

-- Create indexes for efficient querying
CREATE INDEX idx_plan_ahead_profiles_user_id ON public.plan_ahead_profiles(user_id);
CREATE INDEX idx_plan_ahead_profiles_move_date ON public.plan_ahead_profiles(planned_move_date);
CREATE INDEX idx_plan_ahead_profiles_target_cities ON public.plan_ahead_profiles USING GIN(target_cities);
CREATE INDEX idx_plan_ahead_profiles_target_states ON public.plan_ahead_profiles USING GIN(target_states);
CREATE INDEX idx_plan_ahead_profiles_budget_range ON public.plan_ahead_profiles USING GIN(budget_range);
CREATE INDEX idx_plan_ahead_profiles_active ON public.plan_ahead_profiles(is_active, timeline_status);
CREATE INDEX idx_plan_ahead_profiles_housing_types ON public.plan_ahead_profiles USING GIN(preferred_housing_types);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plan_ahead_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_plan_ahead_profiles_updated_at
  BEFORE UPDATE ON public.plan_ahead_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_ahead_profiles_updated_at();

-- Create plan_ahead_matches table for storing match results
CREATE TABLE public.plan_ahead_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matched_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.plan_ahead_profiles(id) ON DELETE CASCADE NOT NULL,
  matched_profile_id UUID REFERENCES public.plan_ahead_profiles(id) ON DELETE CASCADE NOT NULL,
  compatibility_score DECIMAL(3,2) NOT NULL,
  match_factors JSONB,
  status TEXT DEFAULT 'pending',
  user_action TEXT, -- 'liked', 'passed', 'bookmarked'
  matched_user_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_pair UNIQUE(user_id, matched_user_id, profile_id, matched_profile_id),
  CONSTRAINT valid_compatibility_score CHECK (compatibility_score >= 0 AND compatibility_score <= 1)
);

-- Enable RLS for matches
ALTER TABLE public.plan_ahead_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Users can view their own plan ahead matches"
  ON public.plan_ahead_matches
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert their own plan ahead matches"
  ON public.plan_ahead_matches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan ahead matches"
  ON public.plan_ahead_matches
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Create indexes for matches
CREATE INDEX idx_plan_ahead_matches_user_id ON public.plan_ahead_matches(user_id);
CREATE INDEX idx_plan_ahead_matches_matched_user_id ON public.plan_ahead_matches(matched_user_id);
CREATE INDEX idx_plan_ahead_matches_profile_id ON public.plan_ahead_matches(profile_id);
CREATE INDEX idx_plan_ahead_matches_compatibility_score ON public.plan_ahead_matches(compatibility_score DESC);
CREATE INDEX idx_plan_ahead_matches_status ON public.plan_ahead_matches(status);

-- Create trigger for matches updated_at
CREATE TRIGGER update_plan_ahead_matches_updated_at
  BEFORE UPDATE ON public.plan_ahead_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
