-- Remove unused profiles table
-- This table is empty and all services now use user_profiles
-- Run this in Supabase SQL Editor

-- Step 1: Verify the table is empty (safety check)
SELECT 'profiles table has ' || COUNT(*) || ' records' as status FROM profiles;

-- Step 2: Drop the empty profiles table
DROP TABLE IF EXISTS public.profiles;

-- Step 3: Verify removal
SELECT 'profiles table successfully removed' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public');

-- Step 4: Verify user_profiles still exists and has data
SELECT 'user_profiles table has ' || COUNT(*) || ' records and is active' as status FROM user_profiles;
