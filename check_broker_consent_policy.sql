-- Check if the RLS policy for broker consent exists
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
WHERE tablename = 'mortgage_profiles' 
AND policyname = 'Anyone can view profiles with broker consent';
