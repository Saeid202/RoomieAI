-- Setup storage bucket for renovation partner images
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE RENOVATION-PARTNER-IMAGES STORAGE BUCKET
-- =====================================================

-- Create the renovation-partner-images bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'renovation-partner-images',
  'renovation-partner-images',
  true, -- Public bucket for easy access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- 2. ENABLE RLS ON STORAGE (if not already enabled)
-- =====================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. DROP EXISTING POLICIES (to avoid conflicts)
-- =====================================================

DROP POLICY IF EXISTS "Renovation partner images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload renovation partner images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view renovation partner images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view renovation partner images" ON storage.objects;

-- =====================================================
-- 4. CREATE NEW STORAGE POLICIES
-- =====================================================

-- Policy: Anyone can view renovation partner images (public access)
CREATE POLICY "Public can view renovation partner images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'renovation-partner-images');

-- Policy: Admins can upload renovation partner images
CREATE POLICY "Admins can upload renovation partner images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- Policy: Admins can update renovation partner images
CREATE POLICY "Admins can update renovation partner images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- Policy: Admins can delete renovation partner images
CREATE POLICY "Admins can delete renovation partner images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Verify the bucket was created
SELECT 'Renovation partner images storage bucket created successfully' as status;

-- Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'renovation-partner-images';

