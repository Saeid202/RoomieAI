-- =====================================================
-- Legal Templates Storage Setup Script
-- =====================================================
-- This script sets up Supabase Storage for legal document templates
-- =====================================================

-- Create storage bucket for legal templates (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-templates',
  'legal-templates',
  true,
  52428800, -- 50MB limit for PDF templates
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for legal templates (drop existing ones first)
DROP POLICY IF EXISTS "Legal templates are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload legal templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update legal templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete legal templates" ON storage.objects;

CREATE POLICY "Legal templates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'legal-templates');

CREATE POLICY "Authenticated users can upload legal templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'legal-templates' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update legal templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'legal-templates' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete legal templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'legal-templates' 
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- Legal templates storage setup completed successfully!
-- =====================================================
