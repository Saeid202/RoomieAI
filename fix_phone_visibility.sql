-- Fix Phone Number and Profile Visibility columns
-- Run this script in the Supabase SQL Editor

DO $$ 
BEGIN 
    -- 1. Check and Add phone_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'phone_number') THEN
        ALTER TABLE public.roommate ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'Added phone_number column to roommate table';
    ELSE
        RAISE NOTICE 'phone_number column already exists';
    END IF;

    -- 2. Check and Add profile_visibility column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.roommate ADD COLUMN profile_visibility TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added profile_visibility column to roommate table';
    ELSE
        RAISE NOTICE 'profile_visibility column already exists';
    END IF;

    -- 3. Verify 'housing_preference' exists (often related to profile updates)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference TEXT[];
    END IF;

END $$;

-- 4. Reload Schema Cache to Ensure Supabase API picks up the new columns
NOTIFY pgrst, 'reload schema';
