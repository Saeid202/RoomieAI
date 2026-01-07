
-- Ensure public read access to profiles
-- This is critical for fetching creator names for signals

-- 1. Enable RLS on profiles (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy to specific name to ensure we don't duplicate or conflict
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 3. Create the permissive select policy
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- 4. Verify it's working
SELECT COUNT(*) as visible_profiles FROM public.profiles;
