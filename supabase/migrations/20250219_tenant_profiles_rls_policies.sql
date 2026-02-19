-- RLS Policies for tenant_profiles table
-- Allow landlords to view tenant profiles when they have an application

-- Enable RLS on tenant_profiles if not already enabled
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view and edit their own tenant profile
CREATE POLICY "Users can manage their own tenant profile"
ON tenant_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Landlords can view tenant profiles of applicants who applied to their properties
CREATE POLICY "Landlords can view applicant profiles"
ON tenant_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM rental_applications ra
    INNER JOIN properties p ON p.id = ra.property_id
    WHERE ra.applicant_id = tenant_profiles.user_id
      AND p.user_id = auth.uid()
  )
);

-- Policy 3: Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access"
ON tenant_profiles
FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'tenant_profiles'
ORDER BY policyname;
