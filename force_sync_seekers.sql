-- Sync all users with role 'seeker' from auth.users to public.roommate

-- 1. Insert missing profiles
INSERT INTO public.roommate (user_id, email, full_name, role)
SELECT 
    au.id, 
    au.email, 
    -- Try to get name from metadata, fallback to email user part
    COALESCE(
        (au.raw_user_meta_data->>'full_name'), 
        (au.raw_user_meta_data->>'name'), 
        split_part(au.email, '@', 1)
    ) as full_name,
    'seeker'
FROM auth.users au
WHERE 
    -- Check if user is a seeker (either explicit role or no role defined which defaults to seeker for our purpose)
    (au.raw_user_meta_data->>'role' = 'seeker' OR au.raw_user_meta_data->>'role' IS NULL)
    AND NOT EXISTS (
        SELECT 1 FROM public.roommate pr WHERE pr.user_id = au.id
    );

-- 2. Verify the count of seekers vs profiles
DO $$
DECLARE
    auth_count INT;
    profile_count INT;
BEGIN 
    SELECT count(*) INTO auth_count FROM auth.users WHERE raw_user_meta_data->>'role' = 'seeker' OR raw_user_meta_data->>'role' IS NULL;
    SELECT count(*) INTO profile_count FROM public.roommate;
    
    RAISE NOTICE 'Total Seekers in Auth: %', auth_count;
    RAISE NOTICE 'Total Profiles in Roommate Table: %', profile_count;
END $$;
