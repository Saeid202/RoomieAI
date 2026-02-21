-- Check RLS policies on property_documents table
-- to see if buyers with approved access can view documents

-- 1. Check if RLS is enabled
SELECT 
  'RLS Status:' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'property_documents';

-- 2. List all RLS policies
SELECT 
  'RLS Policies:' as check_type,
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'property_documents'
ORDER BY policyname;

-- 3. Check if there's a policy for approved access requests
-- We need a policy that allows users with approved access to view documents

-- 4. Test if buyer can see documents (simulate)
SELECT 
  'Document Count:' as check_type,
  COUNT(*) as total_documents
FROM property_documents
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND deleted_at IS NULL;

-- 5. Check what documents exist for this property
SELECT 
  'Property Documents:' as check_type,
  id,
  document_type,
  document_label,
  file_name,
  is_public,
  uploaded_at
FROM property_documents
WHERE property_id = '3b80948d-74ca-494c-9c4b-9e012fb00add'
  AND deleted_at IS NULL
ORDER BY uploaded_at DESC;
