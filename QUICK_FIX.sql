-- QUICK FIX: Add missing columns to user_profiles table
-- Copy and paste this entire script into your Supabase SQL Editor and run it
-- This fixes the "Could not find the 'user_type' column of 'user_profiles'" error

DO $$ 
BEGIN 
    -- Add user_type column (the main issue)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'user_type'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_type TEXT DEFAULT 'tenant';
        RAISE NOTICE 'Added user_type column';
    ELSE
        RAISE NOTICE 'user_type column already exists';
    END IF;

    -- Add other missing columns that SeekerProfile needs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'age') THEN
        ALTER TABLE public.user_profiles ADD COLUMN age INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'linkedin') THEN
        ALTER TABLE public.user_profiles ADD COLUMN linkedin TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'nationality') THEN
        ALTER TABLE public.user_profiles ADD COLUMN nationality TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'about_me') THEN
        ALTER TABLE public.user_profiles ADD COLUMN about_me TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.user_profiles ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.user_profiles ADD COLUMN profile_visibility TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'language') THEN
        ALTER TABLE public.user_profiles ADD COLUMN language TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'ethnicity') THEN
        ALTER TABLE public.user_profiles ADD COLUMN ethnicity TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'religion') THEN
        ALTER TABLE public.user_profiles ADD COLUMN religion TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'preferred_location') THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'budget_range') THEN
        ALTER TABLE public.user_profiles ADD COLUMN budget_range TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'move_in_date_start') THEN
        ALTER TABLE public.user_profiles ADD COLUMN move_in_date_start TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'move_in_date_end') THEN
        ALTER TABLE public.user_profiles ADD COLUMN move_in_date_end TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'housing_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN housing_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'living_space') THEN
        ALTER TABLE public.user_profiles ADD COLUMN living_space TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'work_location') THEN
        ALTER TABLE public.user_profiles ADD COLUMN work_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'work_schedule') THEN
        ALTER TABLE public.user_profiles ADD COLUMN work_schedule TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'has_pets') THEN
        ALTER TABLE public.user_profiles ADD COLUMN has_pets BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'pet_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN pet_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'smoking') THEN
        ALTER TABLE public.user_profiles ADD COLUMN smoking TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'lives_with_smokers') THEN
        ALTER TABLE public.user_profiles ADD COLUMN lives_with_smokers TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'diet') THEN
        ALTER TABLE public.user_profiles ADD COLUMN diet TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'hobbies') THEN
        ALTER TABLE public.user_profiles ADD COLUMN hobbies TEXT[];
    END IF;

    RAISE NOTICE 'All columns added successfully';
END $$;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the critical column was added
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_type') 
        THEN '✓ user_type column exists - Error should be fixed!'
        ELSE '✗ user_type column MISSING - Please run this script again'
    END as status;
