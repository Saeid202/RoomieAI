-- Check RLS policies on mortgage_profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies 
WHERE tablename = 'mortgage_profiles'
ORDER BY cmd, policyname;
