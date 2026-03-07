-- Verify time-limited access migration was applied correctly

-- 1. Check if access_expires_at column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
  AND column_name IN ('access_expires_at', 'response_message')
ORDER BY column_name;

-- 2. Check if the index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'document_access_requests'
  AND indexname = 'idx_document_access_requests_expires';

-- 3. Check if the expire function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'expire_document_access'
  AND routine_schema = 'public';

-- 4. Check updated RLS policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'property_documents'
  AND policyname = 'Approved requesters can view documents';

-- 5. Test the status constraint (should include 'expired')
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'document_access_requests'
  AND con.contype = 'c'
  AND con.conname LIKE '%status%';
