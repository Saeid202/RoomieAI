-- Add missing preference columns to roommate table that are referenced in the profile form
-- Note: importance levels will be stored in user_preferences table as JSONB

ALTER TABLE public.roommate
ADD COLUMN IF NOT EXISTS age_range_preference INTEGER[] DEFAULT ARRAY[18, 65],
ADD COLUMN IF NOT EXISTS gender_preference TEXT[],
ADD COLUMN IF NOT EXISTS nationality_preference TEXT,
ADD COLUMN IF NOT EXISTS nationality_custom TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT,
ADD COLUMN IF NOT EXISTS language_specific TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT,
ADD COLUMN IF NOT EXISTS dietary_other TEXT,
ADD COLUMN IF NOT EXISTS occupation_preference BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS occupation_specific TEXT,
ADD COLUMN IF NOT EXISTS work_schedule_preference TEXT,
ADD COLUMN IF NOT EXISTS ethnicity_preference TEXT,
ADD COLUMN IF NOT EXISTS ethnicity_other TEXT,
ADD COLUMN IF NOT EXISTS religion_preference TEXT,
ADD COLUMN IF NOT EXISTS religion_other TEXT,
ADD COLUMN IF NOT EXISTS pet_specification TEXT,
ADD COLUMN IF NOT EXISTS smoking_preference TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.roommate.age_range_preference IS 'Preferred age range for roommate as [min, max] array';
COMMENT ON COLUMN public.roommate.gender_preference IS 'Array of preferred genders for roommate';
COMMENT ON COLUMN public.roommate.nationality_preference IS 'Nationality preference: sameCountry, noPreference, custom';
COMMENT ON COLUMN public.roommate.nationality_custom IS 'Custom nationality preference when "custom" is selected';
COMMENT ON COLUMN public.roommate.language_preference IS 'Language preference: sameLanguage, noPreference, specific';
COMMENT ON COLUMN public.roommate.language_specific IS 'Specific language preference when "specific" is selected';
COMMENT ON COLUMN public.roommate.dietary_preferences IS 'Dietary preference: vegetarian, halal, kosher, others, noPreference';
COMMENT ON COLUMN public.roommate.dietary_other IS 'Custom dietary preference when "others" is selected';
COMMENT ON COLUMN public.roommate.occupation_preference IS 'Whether user has occupation preference for roommate';
COMMENT ON COLUMN public.roommate.occupation_specific IS 'Specific occupation preference';
COMMENT ON COLUMN public.roommate.work_schedule_preference IS 'Work schedule preference for roommate';
COMMENT ON COLUMN public.roommate.ethnicity_preference IS 'Ethnicity preference: same, noPreference, others';
COMMENT ON COLUMN public.roommate.ethnicity_other IS 'Custom ethnicity preference when "others" is selected';
COMMENT ON COLUMN public.roommate.religion_preference IS 'Religion preference: same, noPreference, others';
COMMENT ON COLUMN public.roommate.religion_other IS 'Custom religion preference when "others" is selected';
COMMENT ON COLUMN public.roommate.pet_specification IS 'Specific pets user won\'t accept when small pets are ok';
COMMENT ON COLUMN public.roommate.smoking_preference IS 'Smoking preference: noSmoking, noVaping, socialOk'; 