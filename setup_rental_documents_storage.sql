-- =====================================================
-- Rental Documents Storage Setup Script
-- =====================================================
-- This script sets up Supabase Storage for rental application documents
-- =====================================================

-- Create storage bucket for rental documents (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents',
  'rental-documents',
  true,
  10485760, -- 10MB limit
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

-- Create storage policies for rental documents (drop existing ones first)
DROP POLICY IF EXISTS "Rental documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own rental documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own rental documents" ON storage.objects;

CREATE POLICY "Rental documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'rental-documents');

CREATE POLICY "Authenticated users can upload rental documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'rental-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own rental documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own rental documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'rental-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Rental documents storage setup completed successfully!
-- =====================================================
