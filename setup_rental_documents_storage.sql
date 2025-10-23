-- Setup rental-documents storage bucket with proper RLS policies
-- Run this in Supabase SQL Editor

-- 1. Create rental-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents', 
  false, -- Not public by default
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for tenants to upload their own documents
CREATE POLICY "Tenants can upload their own rental documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Create RLS policy for tenants to view their own documents
CREATE POLICY "Tenants can view their own rental documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Create RLS policy for landlords to view documents for their properties
-- This allows landlords to see documents for applications to their properties
CREATE POLICY "Landlords can view documents for their properties" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents'
  AND EXISTS (
    SELECT 1 FROM rental_applications ra
    JOIN properties p ON ra.property_id = p.id
    WHERE ra.id::text = (storage.foldername(name))[2]
    AND p.owner_id = auth.uid()
  )
);

-- 6. Create RLS policy for landlords to download documents for their properties
CREATE POLICY "Landlords can download documents for their properties" ON storage.objects
FOR SELECT USING (
  bucket_id = 'rental-documents'
  AND EXISTS (
    SELECT 1 FROM rental_applications ra
    JOIN properties p ON ra.property_id = p.id
    WHERE ra.id::text = (storage.foldername(name))[2]
    AND p.owner_id = auth.uid()
  )
);

-- 7. Create policy for tenants to delete their own documents
CREATE POLICY "Tenants can delete their own rental documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Verify the setup
SELECT 'Storage bucket created successfully' as status;
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'rental-documents';
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%rental%';