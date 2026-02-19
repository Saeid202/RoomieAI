-- Add seeker profile fields one by one to user_profiles table
-- PostgreSQL requires separate ALTER TABLE statements for each column

-- Step 1: Add personal information columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS prefer_not_to_say TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'everybody';

-- Step 2: Add background columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Step 3: Add preference columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_location TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS move_in_date_start DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS move_in_date_end DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS housing_type TEXT;

-- Step 4: Add lifestyle columns
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_location_legacy TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pet_preference TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_other TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hobbies TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_schedule TEXT CHECK (work_schedule IN ('day shift', 'evening shift', 'night shift'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_location TEXT CHECK (work_location IN ('remote', 'go to office'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pet_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS smoking TEXT CHECK (smoking IN ('Yes', 'No'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lives_with_smokers TEXT CHECK (lives_with_smokers IN ('yes', 'no'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS living_space TEXT;

-- Step 5: Verify all columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('gender', 'prefer_not_to_say', 'phone', 'profile_visibility', 'language', 'ethnicity', 'religion', 'occupation', 'preferred_location', 'budget_range', 'move_in_date_start', 'move_in_date_end', 'housing_type', 'work_location_legacy', 'pet_preference', 'diet', 'diet_other', 'hobbies', 'work_schedule', 'work_location', 'has_pets', 'pet_type', 'smoking', 'lives_with_smokers', 'living_space')
ORDER BY column_name;
