-- =====================================================
-- COMPREHENSIVE FIX FOR STORAGE AND DATABASE ISSUES
-- =====================================================
-- This script fixes the legal-templates bucket and database schema issues
-- =====================================================

-- 1. CREATE LEGAL TEMPLATES STORAGE BUCKET
-- =====================================================
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

-- 2. CREATE STORAGE POLICIES FOR LEGAL TEMPLATES
-- =====================================================
-- Drop existing policies first
DROP POLICY IF EXISTS "Legal templates are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload legal templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update legal templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete legal templates" ON storage.objects;

-- Create new policies
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

-- 3. FIX RENTAL APPLICATIONS TABLE SCHEMA
-- =====================================================
-- Add missing agree_to_terms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rental_applications' 
        AND column_name = 'agree_to_terms'
    ) THEN
        ALTER TABLE rental_applications 
        ADD COLUMN agree_to_terms BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. VERIFY BUCKET CREATION
-- =====================================================
-- Check if the bucket was created successfully
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'legal-templates';

-- 5. VERIFY TABLE SCHEMA
-- =====================================================
-- Check if the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rental_applications' 
AND column_name = 'agree_to_terms';

-- =====================================================
-- FIX COMPLETE - RUN THIS SCRIPT IN SUPABASE SQL EDITOR
-- =====================================================
