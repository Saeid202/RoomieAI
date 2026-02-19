-- Diagnose the profile_visibility constraint issue

-- 1. Show ALL constraints on user_profiles table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass
ORDER BY conname;

-- 2. Show the profile_visibility column details
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'profile_visibility';

-- 3. Show current values in the table
SELECT DISTINCT profile_visibility, COUNT(*) as count
FROM user_profiles
GROUP BY profile_visibility;
