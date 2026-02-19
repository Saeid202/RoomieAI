-- Fix the profile_visibility check constraint issue
-- The form sends "everybody" or "same gender" but the constraint might expect different values

-- Step 1: Check what constraint exists
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND conname LIKE '%profile_visibility%';

-- Step 2: Drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.user_profiles'::regclass 
        AND conname = 'user_profiles_profile_visibility_check'
    ) THEN
        ALTER TABLE public.user_profiles 
        DROP CONSTRAINT user_profiles_profile_visibility_check;
        RAISE NOTICE 'Dropped existing profile_visibility constraint';
    END IF;
END $$;

-- Step 3: Add a new constraint that matches what the form sends
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_profile_visibility_check 
CHECK (profile_visibility IN ('everybody', 'same gender', 'public', 'private', NULL));

-- Step 4: Verify the new constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
AND conname = 'user_profiles_profile_visibility_check';
