-- Add comprehensive seeker profile fields to user_profiles table
-- This will add all the fields needed for detailed seeker profile

-- Step 1: Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS prefer_not_to_say TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'everybody',
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS preferred_location TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS move_in_date_start DATE,
ADD COLUMN IF NOT EXISTS move_in_date_end DATE,
ADD COLUMN IF NOT EXISTS housing_type TEXT,
ADD COLUMN IF NOT EXISTS work_location_legacy TEXT,
ADD COLUMN IF NOT EXISTS pet_preference TEXT,
ADD COLUMN IF NOT EXISTS diet TEXT,
ADD COLUMN IF NOT EXISTS diet_other TEXT,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS work_schedule TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pet_type TEXT,
ADD COLUMN IF NOT EXISTS smoking TEXT,
ADD COLUMN IF NOT EXISTS lives_with_smokers TEXT;

-- Step 2: Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('gender', 'prefer_not_to_say', 'phone', 'profile_visibility', 'language', 'ethnicity', 'religion', 'occupation', 'preferred_location', 'budget_range', 'move_in_date_start', 'move_in_date_end', 'housing_type', 'work_location_legacy', 'pet_preference', 'diet', 'diet_other', 'hobbies', 'work_schedule', 'work_location', 'has_pets', 'pet_type', 'smoking', 'lives_with_smokers')
ORDER BY column_name;
