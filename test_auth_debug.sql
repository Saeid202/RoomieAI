-- Test authentication and user session
-- This will help us debug why currentUser is undefined

-- Check if auth session is valid
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_email,
    auth.role() as current_role,
    NOW() as check_time;

-- Check recent sign-ins
SELECT 
    id,
    email,
    last_sign_in_at,
    created_at
FROM auth.users 
WHERE email = 'info@cargoplus.site'
ORDER BY last_sign_in_at DESC
LIMIT 5;

-- Check if user session is active
SELECT 
    'Session Status' as status,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '❌ No active session'
        WHEN auth.email() IS NOT NULL THEN '⚠️ Email exists but no UID'
        ELSE '✅ Active session'
    END as session_status,
    auth.uid() as user_id,
    auth.email() as email,
    auth.role() as role
FROM (SELECT 1);

-- Test the deleteProperty function directly
-- This might help us see if the issue is in the function itself
SELECT 'deleteProperty function test' as test_result;
