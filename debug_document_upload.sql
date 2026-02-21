-- Check if property_documents bucket exists
SELECT * FROM storage.buckets WHERE name = 'property_documents';

-- Check property_documents table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'property_documents'
ORDER BY ordinal_position;

-- Check if there are any documents in the table
SELECT COUNT(*) as total_documents FROM property_documents;

-- Check RLS policies on property_documents table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'property_documents';

-- Check storage policies
SELECT * FROM storage.objects WHERE bucket_id = 'property_documents' LIMIT 5;
