-- Migration: Set up Supabase Storage for tenant documents
-- Phase 1: Create storage bucket and access policies

-- Create storage bucket for tenant documents (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tenant-documents',
    'tenant-documents',
    false, -- Private bucket
    10485760, -- 10MB file size limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Users can upload their own documents
-- Folder structure: {user_id}/{document_type}/{filename}
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tenant-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'tenant-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update/replace their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'tenant-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'tenant-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Landlords can view tenant documents (for applications)
-- This allows landlords to view documents when reviewing applications
CREATE POLICY "Landlords can view tenant documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'tenant-documents'
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND (user_type = 'landlord' OR user_type LIKE '%landlord%')
    )
);

-- Verify bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'tenant-documents';
