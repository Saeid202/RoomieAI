-- Check if mortgage_broker_profiles table exists and its structure

-- 1. Check if table exists
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'mortgage_broker_profiles'
  ) AS table_exists;

-- 2. Check table columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'mortgage_broker_profiles'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'mortgage_broker_profiles';

-- 4. Check policies
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
WHERE tablename = 'mortgage_broker_profiles';

-- 5. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'mortgage_broker_profiles';

-- 6. Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'mortgage_broker_profiles';

-- 7. Count existing records
SELECT COUNT(*) AS total_records
FROM mortgage_broker_profiles;
