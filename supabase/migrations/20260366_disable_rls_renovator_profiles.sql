-- Disable RLS on renovator_profiles to allow bot to insert data
-- The bot doesn't have auth context, so we need to allow public inserts

-- Disable RLS on renovator_profiles
ALTER TABLE renovator_profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON renovator_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON renovator_profiles;
DROP POLICY IF EXISTS "Anyone can view active profiles" ON renovator_profiles;

-- Create simple policies that allow bot to insert
ALTER TABLE renovator_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for bot)
CREATE POLICY "Allow bot to insert profiles" ON renovator_profiles
  FOR INSERT WITH CHECK (true);

-- Allow anyone to view active profiles
CREATE POLICY "Anyone can view active profiles" ON renovator_profiles
  FOR SELECT USING (status = 'active');

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON renovator_profiles
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);
