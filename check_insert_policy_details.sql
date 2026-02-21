-- Check the details of the INSERT policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname = 'Users can upload to property-documents';

-- Also check what user is currently logged in
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;
