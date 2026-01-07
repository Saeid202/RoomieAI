
-- Check signals and associated profiles
SELECT 
    s.id as signal_id, 
    s.user_id, 
    s.household_type,
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.email
FROM 
    co_ownership_signals s
LEFT JOIN 
    profiles p ON s.user_id = p.id;

-- Check if RLS is enabled on profiles
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE oid = 'public.profiles'::regclass;

-- Check policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
