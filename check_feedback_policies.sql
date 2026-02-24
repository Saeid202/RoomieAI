-- Check current RLS policies on mortgage_profile_feedback table
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
WHERE tablename = 'mortgage_profile_feedback'
ORDER BY policyname;
