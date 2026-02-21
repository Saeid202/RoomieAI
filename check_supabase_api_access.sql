-- Check if document_access_requests table is accessible via Supabase API
-- This verifies the table is properly set up for API access

-- 1. Check table exists and is in public schema
SELECT 
  'Table Location:' as check_type,
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'document_access_requests';

-- 2. Check if RLS is enabled (required for Supabase API)
SELECT 
  'RLS Status:' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'document_access_requests';

-- 3. List all columns (verify structure)
SELECT 
  'Table Structure:' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
ORDER BY ordinal_position;

-- 4. Check grants (API needs SELECT permission)
SELECT 
  'Table Grants:' as check_type,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'document_access_requests'
  AND grantee IN ('authenticated', 'anon', 'postgres');

-- 5. Verify the specific request exists
SELECT 
  'Request Data:' as check_type,
  id,
  property_id,
  requester_id,
  requester_email,
  status,
  requested_at,
  reviewed_at
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103'
ORDER BY requested_at DESC;

-- 6. Check if there are multiple requests (might be getting wrong one)
SELECT 
  'All Requests for Property:' as check_type,
  id,
  requester_email,
  status,
  requested_at
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
ORDER BY requested_at DESC;

-- 7. Test the exact query the frontend is using
SELECT 
  'Frontend Query Test:' as check_type,
  *
FROM document_access_requests
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND requester_id = 'd599e69e-407f-44f4-899d-14a1e3af1103'
LIMIT 1;
