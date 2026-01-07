
-- Aggressively check and fix missing profiles
-- This script does NOT rely on role mapping complexity initially, to ensure insertion happens.

BEGIN;

-- 1. Insert missing profiles for ALL users in auth.users
-- We fallback to 'Seeker' if role is missing/weird, and just use email as fallback for name.
INSERT INTO public.profiles (id, email, full_name, user_type)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    CASE 
        WHEN (au.raw_user_meta_data->>'role') ILIKE 'landlord' THEN 'Landlord'::public.user_type
        WHEN (au.raw_user_meta_data->>'role') ILIKE 'renovator' THEN 'Renovator'::public.user_type
        ELSE 'Seeker'::public.user_type
    END
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- 2. Ensure RLS allows reading these profiles (Redundant but safe)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- 3. Verify specific user exists (Debugging output)
DO $$
DECLARE
    target_email text := 'info@cargoplus.site';
    rec record;
BEGIN
    SELECT * INTO rec FROM public.profiles WHERE email = target_email;
    IF FOUND THEN
        RAISE NOTICE 'Profile exists for %: Name=%, Role=%', target_email, rec.full_name, rec.user_type;
    ELSE
        RAISE NOTICE 'WARNING: Profile STILL MISSING for %', target_email;
    END IF;
END $$;

COMMIT;
