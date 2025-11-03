-- Check if rental-documents bucket exists and verify RLS policies
-- Run this in Supabase SQL Editor

-- 1. Check if rental-documents bucket exists
SELECT * FROM storage.buckets WHERE name = 'rental-documents';

-- 2. Check current RLS policies for rental-documents bucket
SELECT * FROM storage.policies WHERE bucket_id = 'rental-documents';

-- 3. Check if rental_documents table exists and has proper structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rental_documents' 
ORDER BY ordinal_position;

-- 4. Test if we can access the bucket (this will show any permission issues)
SELECT * FROM storage.objects WHERE bucket_id = 'rental-documents' LIMIT 5;