-- Diagnostic: Check properties table RLS status and policies

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'properties' AND schemaname = 'public';

-- 2. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'properties'
ORDER BY cmd, policyname;

-- 3. Check your user ID
SELECT auth.uid() as my_user_id;

-- 4. Try to select your properties (this will show if RLS is blocking)
SELECT 
  id,
  user_id,
  address,
  title,
  status,
  created_at,
  CASE 
    WHEN user_id = auth.uid() THEN 'YOURS'
    ELSE 'NOT YOURS'
  END as ownership
FROM properties
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 5. Count properties by status
SELECT 
  status,
  COUNT(*) as count
FROM properties
WHERE user_id = auth.uid()
GROUP BY status;
