-- Check all storage policies for property-documents bucket
SELECT 
  id,
  name,
  bucket_id,
  definition,
  check_expression,
  command
FROM storage.policies 
WHERE bucket_id = 'property-documents'
ORDER BY name;

-- Check if RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- Check what the current user can do
SELECT auth.uid() as current_user_id;

-- Check if there are ANY policies on storage.objects
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
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;
