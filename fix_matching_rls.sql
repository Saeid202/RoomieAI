-- Drop the restrictive SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.roommate;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.roommate;

-- Create a permissive SELECT policy for authenticated users
-- This allows finding matches among all users
CREATE POLICY "Users can view all profiles" 
ON public.roommate FOR SELECT 
TO authenticated 
USING (true);

-- Ensure Insert/Update/Delete remain private (users can only edit themselves)
-- (Re-applying these just in case, using restrictive clauses)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.roommate;
CREATE POLICY "Users can insert own profile" 
ON public.roommate FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.roommate;
CREATE POLICY "Users can update own profile" 
ON public.roommate FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Verify row count to confirm if data exists
SELECT count(*) as total_profiles FROM public.roommate;
