-- Debug properties query to understand the exact issue

-- 1. Check if properties table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'properties'
);

-- 2. Check properties table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- 3. Try the exact query the service is using
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT id, address, city, province, status
FROM properties
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 4. Check RLS policies on properties table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'properties';

-- 5. Check if you have any properties at all
SELECT COUNT(*) as total_properties FROM properties;

-- 6. Check if landlord_availability table exists and is accessible
SELECT COUNT(*) as availability_count FROM landlord_availability;
