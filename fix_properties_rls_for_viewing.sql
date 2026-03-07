-- Fix RLS policies for properties table to allow landlords to read their own properties
-- This is needed for the viewing appointments availability manager

-- First, check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'properties';

-- Drop and recreate the SELECT policy to ensure landlords can read their properties
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can view their own properties" ON properties;
DROP POLICY IF EXISTS "Property owners can view their properties" ON properties;

-- Create a comprehensive SELECT policy
CREATE POLICY "Users can view their own properties"
  ON properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- Also allow public viewing of active properties (for tenants browsing)
CREATE POLICY "Anyone can view active properties"
  ON properties
  FOR SELECT
  USING (status IN ('active', 'pending'));

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'properties'
ORDER BY policyname;
