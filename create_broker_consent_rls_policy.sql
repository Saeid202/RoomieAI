-- Create RLS policy to allow anyone to view profiles with broker consent
-- This allows mortgage brokers to see profiles where broker_consent = true

-- First, drop the policy if it exists (to avoid errors)
DROP POLICY IF EXISTS "Anyone can view profiles with broker consent" ON mortgage_profiles;

-- Create the policy
CREATE POLICY "Anyone can view profiles with broker consent"
ON mortgage_profiles
FOR SELECT
USING (broker_consent = TRUE);

-- Verify the policy was created
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'mortgage_profiles'
ORDER BY policyname;
