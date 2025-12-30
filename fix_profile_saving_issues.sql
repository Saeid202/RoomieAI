-- Fix for Roommate Profile Saving Issues & Add LinkedIn Profile
-- This script ensures all required columns exist with the correct text/array types and sets up proper RLS policies.

DO $$ 
BEGIN 
    -- 1. Ensure basic demographic columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'age') THEN
        ALTER TABLE public.roommate ADD COLUMN age INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'gender') THEN
        ALTER TABLE public.roommate ADD COLUMN gender TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'phone_number') THEN
        ALTER TABLE public.roommate ADD COLUMN phone_number TEXT;
    END IF;

    -- Added LinkedIn Profile column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'linkedin_profile') THEN
        ALTER TABLE public.roommate ADD COLUMN linkedin_profile TEXT;
    END IF;

    -- 2. Ensure "About Me" specific columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'nationality') THEN
        ALTER TABLE public.roommate ADD COLUMN nationality TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'language') THEN
        ALTER TABLE public.roommate ADD COLUMN language TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'ethnicity') THEN
        ALTER TABLE public.roommate ADD COLUMN ethnicity TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'religion') THEN
        ALTER TABLE public.roommate ADD COLUMN religion TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'occupation') THEN
        ALTER TABLE public.roommate ADD COLUMN occupation TEXT;
    END IF;

    -- 3. Ensure "profile_visibility" is an ARRAY of TEXT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.roommate ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];
    ELSE
        -- Attempt to convert if it exists but might be wrong type
        BEGIN
            ALTER TABLE public.roommate ALTER COLUMN profile_visibility TYPE TEXT[] USING profile_visibility::text[];
        EXCEPTION WHEN OTHERS THEN
            NULL; 
        END;
    END IF;

    -- 4. Ensure "preferred_location" is an ARRAY of TEXT
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'preferred_location') THEN
        ALTER TABLE public.roommate ADD COLUMN preferred_location TEXT[] DEFAULT ARRAY[]::TEXT[];
    ELSE
        -- Attempt to convert if it exists but might be wrong type
        BEGIN
            ALTER TABLE public.roommate ALTER COLUMN preferred_location TYPE TEXT[] USING preferred_location::text[];
        EXCEPTION WHEN OTHERS THEN
            NULL; 
        END;
    END IF;
    
    -- 5. Ensure "budget_range" is an ARRAY of INTEGER (numrange or int4range is better but app typically uses arrays for flexibility/simplicity in JSON)
    -- Checking what the app expects. typescript says number[].
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'budget_range') THEN
        ALTER TABLE public.roommate ADD COLUMN budget_range INTEGER[]; -- array of integers for [min, max]
    END IF;

END $$;

-- 6. Ensure Row Level Security (RLS) Policies allow updates
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Policy for users to update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.roommate
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Policy for users to insert their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON public.roommate
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy for everyone to view profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roommate' 
        AND policyname = 'Everyone can view profiles'
    ) THEN
        CREATE POLICY "Everyone can view profiles" ON public.roommate
        FOR SELECT USING (true);
    END IF;
END $$;

-- 7. Reload schema to make sure API is aware of changes
NOTIFY pgrst, 'reload schema';
