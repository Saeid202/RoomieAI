-- Completely disable RLS on renovator_profiles table
-- This allows the bot to insert data without authentication

-- First, disable RLS entirely
ALTER TABLE renovator_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow bot to insert profiles" ON renovator_profiles;
DROP POLICY IF EXISTS "Anyone can view active profiles" ON renovator_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON renovator_profiles;

-- Verify RLS is disabled
-- SELECT tablename FROM pg_tables WHERE tablename = 'renovator_profiles';
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'renovator_profiles';
