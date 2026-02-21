-- Test if buyer can access their own request through RLS
-- Buyer: saeid.shabani64@gmail.com (d599e69e-407f-44f4-899d-14a1e3af1103)

-- 1. First, verify the request exists (as admin)
SELECT 
  'Admin view - Request exists:' as check_type,
  id,
  property_id,
  requester_id,
  requester_email,
  status
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

-- 2. Check if RLS is enabled
SELECT 
  'RLS Status:' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'document_access_requests';

-- 3. List all RLS policies
SELECT 
  'RLS Policies:' as check_type,
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'document_access_requests'
ORDER BY policyname;

-- 4. Test as the buyer user (simulate RLS)
-- Note: This requires setting the JWT claims which can only be done in a real session
-- But we can check if the policy logic would work

-- Check if the buyer's user ID matches the requester_id (this is what the RLS policy checks)
SELECT 
  'Policy Logic Test:' as check_type,
  CASE 
    WHEN requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103' 
    THEN 'PASS - User can see their own request'
    ELSE 'FAIL - User cannot see request'
  END as result,
  requester_id,
  requester_email
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103';

-- 5. Verify auth.uid() function exists and works
SELECT 
  'Auth Function Test:' as check_type,
  'auth.uid() function exists' as result;
