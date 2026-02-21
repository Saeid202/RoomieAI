-- Debug property image upload issue

-- 1. Check if bucket exists
SELECT 'BUCKET CHECK:' as step;
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'property-images';

-- 2. Check policies
SELECT 'POLICIES CHECK:' as step;
SELECT 
    policyname,
    cmd,
    roles,
    CASE 
        WHEN cmd = 'INSERT' THEN 'Upload'
        WHEN cmd = 'SELECT' THEN 'View'
        WHEN cmd = 'DELETE' THEN 'Delete'
        WHEN cmd = 'UPDATE' THEN 'Update'
    END as action
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%property%image%'
ORDER BY cmd;

-- 3. Check current user (run this while logged in)
SELECT 'CURRENT USER:' as step;
SELECT 
    auth.uid() as user_id,
    auth.role() as user_role;

-- 4. Test if user can theoretically upload
SELECT 'PERMISSION TEST:' as step;
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'User is authenticated ✓'
        ELSE 'User is NOT authenticated ✗'
    END as auth_status;
