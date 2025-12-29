-- 1. Ensure the 'role' column exists in public.roommate
-- Often role is stored in auth.metadata, but having it here makes queries easier
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roommate' AND column_name = 'role') THEN
        ALTER TABLE public.roommate ADD COLUMN role TEXT DEFAULT 'seeker';
    END IF;
END $$;

-- 2. Insert missing profiles (modified to work even if role column existed or was just added)
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
    -- Check if user is a seeker (or role is missing)
    (au.raw_user_meta_data->>'role' = 'seeker' OR au.raw_user_meta_data->>'role' IS NULL)
    AND NOT EXISTS (
        SELECT 1 FROM public.roommate pr WHERE pr.user_id = au.id
    );

-- 3. Check/verify results
SELECT count(*) as new_total_profiles FROM public.roommate;
