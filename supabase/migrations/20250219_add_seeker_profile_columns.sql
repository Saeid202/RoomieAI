-- Add all missing columns to user_profiles table for SeekerProfile functionality
-- This migration adds columns that SeekerProfile.tsx is trying to save

DO $$ 
BEGIN 
    -- Basic profile fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'age') THEN
        ALTER TABLE public.user_profiles ADD COLUMN age INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'linkedin') THEN
        ALTER TABLE public.user_profiles ADD COLUMN linkedin TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'nationality') THEN
        ALTER TABLE public.user_profiles ADD COLUMN nationality TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'about_me') THEN
        ALTER TABLE public.user_profiles ADD COLUMN about_me TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.user_profiles ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'prefer_not_to_say') THEN
        ALTER TABLE public.user_profiles ADD COLUMN prefer_not_to_say TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.user_profiles ADD COLUMN profile_visibility TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'language') THEN
        ALTER TABLE public.user_profiles ADD COLUMN language TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'ethnicity') THEN
        ALTER TABLE public.user_profiles ADD COLUMN ethnicity TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'religion') THEN
        ALTER TABLE public.user_profiles ADD COLUMN religion TEXT;
    END IF;

    -- Housing preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'preferred_location') THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'budget_range') THEN
        ALTER TABLE public.user_profiles ADD COLUMN budget_range TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'move_in_date_start') THEN
        ALTER TABLE public.user_profiles ADD COLUMN move_in_date_start TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'move_in_date_end') THEN
        ALTER TABLE public.user_profiles ADD COLUMN move_in_date_end TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'housing_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN housing_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'living_space') THEN
        ALTER TABLE public.user_profiles ADD COLUMN living_space TEXT;
    END IF;

    -- Work and lifestyle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'work_location') THEN
        ALTER TABLE public.user_profiles ADD COLUMN work_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'work_location_legacy') THEN
        ALTER TABLE public.user_profiles ADD COLUMN work_location_legacy TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'work_schedule') THEN
        ALTER TABLE public.user_profiles ADD COLUMN work_schedule TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'pet_preference') THEN
        ALTER TABLE public.user_profiles ADD COLUMN pet_preference TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'has_pets') THEN
        ALTER TABLE public.user_profiles ADD COLUMN has_pets BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'pet_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN pet_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'smoking') THEN
        ALTER TABLE public.user_profiles ADD COLUMN smoking TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'lives_with_smokers') THEN
        ALTER TABLE public.user_profiles ADD COLUMN lives_with_smokers TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'diet') THEN
        ALTER TABLE public.user_profiles ADD COLUMN diet TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'diet_other') THEN
        ALTER TABLE public.user_profiles ADD COLUMN diet_other TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'hobbies') THEN
        ALTER TABLE public.user_profiles ADD COLUMN hobbies TEXT[];
    END IF;

    -- User type field (the one causing the error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'user_type') THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_type TEXT DEFAULT 'tenant';
    END IF;

END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.user_type IS 'Type of user: tenant, landlord, buyer, etc.';
COMMENT ON COLUMN public.user_profiles.age IS 'User age';
COMMENT ON COLUMN public.user_profiles.gender IS 'User gender identity';
COMMENT ON COLUMN public.user_profiles.profile_visibility IS 'Who can see this profile';
COMMENT ON COLUMN public.user_profiles.housing_type IS 'Preferred housing type';
COMMENT ON COLUMN public.user_profiles.hobbies IS 'Array of user hobbies';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added
SELECT 
    'Added ' || COUNT(*) || ' columns to user_profiles table' as status
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_profiles'
    AND column_name IN (
        'age', 'linkedin', 'nationality', 'about_me', 'gender', 
        'prefer_not_to_say', 'profile_visibility', 'language', 'ethnicity', 
        'religion', 'preferred_location', 'budget_range', 'move_in_date_start', 
        'move_in_date_end', 'housing_type', 'living_space', 'work_location', 
        'work_location_legacy', 'work_schedule', 'pet_preference', 'has_pets', 
        'pet_type', 'smoking', 'lives_with_smokers', 'diet', 'diet_other', 
        'hobbies', 'user_type'
    );
