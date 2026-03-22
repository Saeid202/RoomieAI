-- Fix RLS on renovation_matches to allow bot to insert data

-- Drop existing policies
DROP POLICY IF EXISTS "Customers can view their matches" ON renovation_matches;
DROP POLICY IF EXISTS "Renovators can view their matches" ON renovation_matches;
DROP POLICY IF EXISTS "System can create matches" ON renovation_matches;
DROP POLICY IF EXISTS "Both parties can update match status" ON renovation_matches;

-- Disable and re-enable RLS
ALTER TABLE renovation_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_matches ENABLE ROW LEVEL SECURITY;

-- Allow bot to insert matches
CREATE POLICY "Allow bot to insert matches" ON renovation_matches
  FOR INSERT WITH CHECK (true);

-- Allow customers to view their matches
CREATE POLICY "Customers can view their matches" ON renovation_matches
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IS NULL);

-- Allow renovators to view their matches
CREATE POLICY "Renovators can view their matches" ON renovation_matches
  FOR SELECT USING (auth.uid() = renovator_id OR auth.uid() IS NULL);

-- Allow both parties to update match status
CREATE POLICY "Both parties can update match status" ON renovation_matches
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = renovator_id OR auth.uid() IS NULL);
