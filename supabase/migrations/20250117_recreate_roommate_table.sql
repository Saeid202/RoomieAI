-- Drop and recreate roommate table with correct schema
-- This migration fixes field mismatches between frontend and database

-- First, drop the existing table and its constraints
DROP TABLE IF EXISTS public.roommate CASCADE;

-- Create the new roommate table with proper schema
CREATE TABLE public.roommate (
  -- Primary keys and references
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Basic Information
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  email TEXT,
  phone_number TEXT,
  linkedin_profile TEXT,
  profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Actual demographic information (user's own information)
  nationality TEXT,
  language TEXT,
  ethnicity TEXT,
  religion TEXT,
  occupation TEXT,
  
  -- Housing Preferences
  preferred_location TEXT[], -- Array of preferred locations
  budget_range INTEGER[], -- [min, max] budget range
  move_in_date_start DATE,
  move_in_date_end DATE,
  housing_type TEXT CHECK (housing_type IN ('house', 'apartment')),
  living_space TEXT CHECK (living_space IN ('privateRoom', 'sharedRoom', 'entirePlace')),
  
  -- Lifestyle & Habits
  smoking BOOLEAN,
  lives_with_smokers BOOLEAN,
  has_pets BOOLEAN,
  pet_type TEXT, -- Type of pets user has
  work_location TEXT CHECK (work_location IN ('remote', 'office', 'hybrid')),
  work_schedule TEXT CHECK (work_schedule IN ('dayShift', 'afternoonShift', 'overnightShift')),
  hobbies TEXT[],
  diet TEXT CHECK (diet IN ('vegetarian', 'halal', 'kosher', 'noPreference', 'other')),
  diet_other TEXT, -- Custom diet description when 'other' is selected
  
  -- Legacy fields (kept for compatibility)
  pet_preference TEXT,
  work_location_legacy TEXT, -- Old work_location field
  roommate_gender_preference TEXT,
  roommate_lifestyle_preference TEXT,
  important_roommate_traits TEXT[],
  
  -- Ideal Roommate Preferences
  age_range_preference INTEGER[] DEFAULT ARRAY[18, 65],
  gender_preference TEXT[],
  nationality_preference TEXT CHECK (nationality_preference IN ('sameCountry', 'noPreference', 'custom')),
  nationality_custom TEXT,
  language_preference TEXT CHECK (language_preference IN ('sameLanguage', 'noPreference', 'specific')),
  language_specific TEXT,
  dietary_preferences TEXT CHECK (dietary_preferences IN ('vegetarian', 'halal', 'kosher', 'others', 'noPreference')),
  dietary_other TEXT,
  occupation_preference BOOLEAN DEFAULT false,
  occupation_specific TEXT,
  work_schedule_preference TEXT CHECK (work_schedule_preference IN ('opposite', 'dayShift', 'afternoonShift', 'overnightShift', 'noPreference')),
  ethnicity_preference TEXT CHECK (ethnicity_preference IN ('same', 'noPreference', 'others')),
  ethnicity_other TEXT,
  religion_preference TEXT CHECK (religion_preference IN ('same', 'noPreference', 'others')),
  religion_other TEXT,
  pet_preference_enum TEXT CHECK (pet_preference_enum IN ('noPets', 'catOk', 'smallPetsOk')),
  pet_specification TEXT,
  smoking_preference TEXT CHECK (smoking_preference IN ('noSmoking', 'noVaping', 'socialOk')),
  roommate_hobbies TEXT[],
  rent_option TEXT CHECK (rent_option IN ('findTogether', 'joinExisting')),
  
  -- Preference importance fields
  age_range_preference_importance TEXT DEFAULT 'notImportant' CHECK (age_range_preference_importance IN ('notImportant', 'important', 'must')),
  gender_preference_importance TEXT DEFAULT 'notImportant' CHECK (gender_preference_importance IN ('notImportant', 'important', 'must')),
  nationality_preference_importance TEXT DEFAULT 'notImportant' CHECK (nationality_preference_importance IN ('notImportant', 'important', 'must')),
  language_preference_importance TEXT DEFAULT 'notImportant' CHECK (language_preference_importance IN ('notImportant', 'important', 'must')),
  dietary_preferences_importance TEXT DEFAULT 'notImportant' CHECK (dietary_preferences_importance IN ('notImportant', 'important', 'must')),
  occupation_preference_importance TEXT DEFAULT 'notImportant' CHECK (occupation_preference_importance IN ('notImportant', 'important', 'must')),
  work_schedule_preference_importance TEXT DEFAULT 'notImportant' CHECK (work_schedule_preference_importance IN ('notImportant', 'important', 'must')),
  ethnicity_preference_importance TEXT DEFAULT 'notImportant' CHECK (ethnicity_preference_importance IN ('notImportant', 'important', 'must')),
  religion_preference_importance TEXT DEFAULT 'notImportant' CHECK (religion_preference_importance IN ('notImportant', 'important', 'must')),
  pet_preference_importance TEXT DEFAULT 'notImportant' CHECK (pet_preference_importance IN ('notImportant', 'important', 'must')),
  smoking_preference_importance TEXT DEFAULT 'notImportant' CHECK (smoking_preference_importance IN ('notImportant', 'important', 'must')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.roommate
ADD CONSTRAINT roommate_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_roommate_user_id ON public.roommate(user_id);
CREATE INDEX idx_roommate_preferred_location ON public.roommate USING GIN (preferred_location);
CREATE INDEX idx_roommate_age ON public.roommate(age);
CREATE INDEX idx_roommate_gender ON public.roommate(gender);
CREATE INDEX idx_roommate_budget_range ON public.roommate USING GIN (budget_range);

-- Enable RLS (Row Level Security)
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all roommate profiles" 
ON public.roommate FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own roommate profile" 
ON public.roommate FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roommate profile" 
ON public.roommate FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roommate profile" 
ON public.roommate FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roommate_updated_at
  BEFORE UPDATE ON public.roommate
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.roommate IS 'Roommate profiles with comprehensive matching preferences';
COMMENT ON COLUMN public.roommate.preferred_location IS 'Array of preferred locations for finding roommates';
COMMENT ON COLUMN public.roommate.budget_range IS 'Budget range as [min, max] array in dollars';
COMMENT ON COLUMN public.roommate.profile_visibility IS 'Array of visibility groups allowed to view the profile';
COMMENT ON COLUMN public.roommate.move_in_date_start IS 'Earliest move-in date';
COMMENT ON COLUMN public.roommate.move_in_date_end IS 'Latest move-in date';
COMMENT ON COLUMN public.roommate.nationality IS 'User actual nationality';
COMMENT ON COLUMN public.roommate.language IS 'User primary language';
COMMENT ON COLUMN public.roommate.ethnicity IS 'User ethnicity';
COMMENT ON COLUMN public.roommate.religion IS 'User religion';
COMMENT ON COLUMN public.roommate.occupation IS 'User current occupation';
COMMENT ON COLUMN public.roommate.work_location IS 'User work location type: remote, office, hybrid';
COMMENT ON COLUMN public.roommate.diet IS 'User dietary preferences with consistent enum values';
COMMENT ON COLUMN public.roommate.pet_preference_enum IS 'New enum-based pet preference field'; 