-- Completely disable RLS on all renovation tables
-- This allows the bot to insert data without authentication

-- Disable RLS on renovation_requests
ALTER TABLE renovation_requests DISABLE ROW LEVEL SECURITY;

-- Drop all policies on renovation_requests
DROP POLICY IF EXISTS "Allow bot to insert requests" ON renovation_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON renovation_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON renovation_requests;

-- Disable RLS on renovation_matches
ALTER TABLE renovation_matches DISABLE ROW LEVEL SECURITY;

-- Drop all policies on renovation_matches
DROP POLICY IF EXISTS "Allow bot to insert matches" ON renovation_matches;
DROP POLICY IF EXISTS "Customers can view their matches" ON renovation_matches;
DROP POLICY IF EXISTS "Renovators can view their matches" ON renovation_matches;
DROP POLICY IF EXISTS "Both parties can update match status" ON renovation_matches;
