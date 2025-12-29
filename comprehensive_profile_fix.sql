-- COMPREHENSIVE FIX for Profile Saving Issues
-- Run this entire script to fix Permissions, Schema Cache, and Missing Columns

-- 1. Reload Schema Cache (Critical for new columns to be recognized)
NOTIFY pgrst, 'reload schema';

-- 2. Ensure 'role' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'role') THEN
        ALTER TABLE public.roommate ADD COLUMN role TEXT DEFAULT 'seeker';
    END IF;
END $$;

-- 3. Ensure 'housing_preference_importance' exists (Previous known blocker)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'housing_preference_importance') THEN
        ALTER TABLE public.roommate ADD COLUMN housing_preference_importance TEXT DEFAULT 'notImportant';
    END IF;
END $$;

-- 4. FORCE Re-apply RLS Policies (Ensures you can UPDATE your own row)
ALTER TABLE public.roommate ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.roommate;
CREATE POLICY "Users can update own profile" 
ON public.roommate FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.roommate;
CREATE POLICY "Users can insert own profile" 
ON public.roommate FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all profiles" ON public.roommate;
CREATE POLICY "Users can view all profiles" 
ON public.roommate FOR SELECT 
TO authenticated
USING (true);

-- 5. TEST: Manually set Age=35 and Gender=Male for your user
-- This verifies if the database itself is working
UPDATE public.roommate
SET 
    age = 35, 
    gender = 'male',
    role = 'seeker'
WHERE email = 'saeid.shabani64@gmail.com';

-- 6. Show the result to confirm it's saved
SELECT email, age, gender, role FROM public.roommate WHERE email = 'saeid.shabani64@gmail.com';
