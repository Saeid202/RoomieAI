-- COMPREHENSIVE UNIFIED PROFILE COLUMNS FIX
-- This script adds ALL missing columns needed for the unified Profile + About Me form
-- Run this to ensure all form fields can be saved to the database

-- First, reload schema cache to recognize new columns
NOTIFY pgrst, 'reload schema';

-- Check if we're using profiles table or roommate table
DO $$
BEGIN
    -- Add missing columns to profiles table (primary table for unified profile)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Working with profiles table';
        
        -- 1. Personal Information Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
            ALTER TABLE public.profiles ADD COLUMN gender TEXT DEFAULT 'prefer-not-to-say';
            RAISE NOTICE 'Added gender column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
            ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
            RAISE NOTICE 'Added phone_number column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_visibility') THEN
            ALTER TABLE public.profiles ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];
            RAISE NOTICE 'Added profile_visibility column to profiles';
        END IF;
        
        -- 2. Contact & Professional Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_profile') THEN
            ALTER TABLE public.profiles ADD COLUMN linkedin_profile TEXT;
            RAISE NOTICE 'Added linkedin_profile column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language') THEN
            ALTER TABLE public.profiles ADD COLUMN language TEXT;
            RAISE NOTICE 'Added language column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ethnicity') THEN
            ALTER TABLE public.profiles ADD COLUMN ethnicity TEXT;
            RAISE NOTICE 'Added ethnicity column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'religion') THEN
            ALTER TABLE public.profiles ADD COLUMN religion TEXT;
            RAISE NOTICE 'Added religion column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
            ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
            RAISE NOTICE 'Added occupation column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_location') THEN
            ALTER TABLE public.profiles ADD COLUMN work_location TEXT DEFAULT 'remote';
            RAISE NOTICE 'Added work_location column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_schedule') THEN
            ALTER TABLE public.profiles ADD COLUMN work_schedule TEXT DEFAULT 'dayShift';
            RAISE NOTICE 'Added work_schedule column to profiles';
        END IF;
        
        -- 3. Lifestyle & Preferences Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'diet') THEN
            ALTER TABLE public.profiles ADD COLUMN diet TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added diet column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'diet_other') THEN
            ALTER TABLE public.profiles ADD COLUMN diet_other TEXT;
            RAISE NOTICE 'Added diet_other column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'smoking') THEN
            ALTER TABLE public.profiles ADD COLUMN smoking BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added smoking column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lives_with_smokers') THEN
            ALTER TABLE public.profiles ADD COLUMN lives_with_smokers BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added lives_with_smokers column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_pets') THEN
            ALTER TABLE public.profiles ADD COLUMN has_pets BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added has_pets column to profiles';
        END IF;
        
        -- 4. Housing Preferences Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_location') THEN
            ALTER TABLE public.profiles ADD COLUMN preferred_location TEXT[] DEFAULT ARRAY[]::TEXT[];
            RAISE NOTICE 'Added preferred_location column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget_range') THEN
            ALTER TABLE public.profiles ADD COLUMN budget_range INTEGER[] DEFAULT ARRAY[800, 1500];
            RAISE NOTICE 'Added budget_range column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'move_in_date_start') THEN
            ALTER TABLE public.profiles ADD COLUMN move_in_date_start TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added move_in_date_start column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'housing_type') THEN
            ALTER TABLE public.profiles ADD COLUMN housing_type TEXT DEFAULT 'apartment';
            RAISE NOTICE 'Added housing_type column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'living_space') THEN
            ALTER TABLE public.profiles ADD COLUMN living_space TEXT DEFAULT 'privateRoom';
            RAISE NOTICE 'Added living_space column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hobbies') THEN
            ALTER TABLE public.profiles ADD COLUMN hobbies TEXT[] DEFAULT ARRAY[]::TEXT[];
            RAISE NOTICE 'Added hobbies column to profiles';
        END IF;
        
        -- 5. Roommate Preference Fields (for matching)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN gender_preference TEXT[] DEFAULT ARRAY[]::TEXT[];
            RAISE NOTICE 'Added gender_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nationality_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN nationality_preference TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added nationality_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN language_preference TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added language_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ethnicity_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN ethnicity_preference TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added ethnicity_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'religion_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN religion_preference TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added religion_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN occupation_preference BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added occupation_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_schedule_preference') THEN
            ALTER TABLE public.profiles ADD COLUMN work_schedule_preference TEXT DEFAULT 'noPreference';
            RAISE NOTICE 'Added work_schedule_preference column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'roommate_hobbies') THEN
            ALTER TABLE public.profiles ADD COLUMN roommate_hobbies TEXT[] DEFAULT ARRAY[]::TEXT[];
            RAISE NOTICE 'Added roommate_hobbies column to profiles';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rent_option') THEN
            ALTER TABLE public.profiles ADD COLUMN rent_option TEXT DEFAULT 'findTogether';
            RAISE NOTICE 'Added rent_option column to profiles';
        END IF;
        
    ELSE
        RAISE NOTICE 'profiles table does not exist. Please create it first.';
    END IF;
END $$;

-- Show final status
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;
