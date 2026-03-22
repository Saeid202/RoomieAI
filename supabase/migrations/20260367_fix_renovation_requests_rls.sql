-- Fix RLS on renovation_requests to allow bot to insert data

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own requests" ON renovation_requests;
DROP POLICY IF EXISTS "Users can create requests" ON renovation_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON renovation_requests;

-- Disable and re-enable RLS
ALTER TABLE renovation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_requests ENABLE ROW LEVEL SECURITY;

-- Allow bot to insert requests
CREATE POLICY "Allow bot to insert requests" ON renovation_requests
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own requests
CREATE POLICY "Users can view their own requests" ON renovation_requests
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow users to update their own requests
CREATE POLICY "Users can update their own requests" ON renovation_requests
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);
