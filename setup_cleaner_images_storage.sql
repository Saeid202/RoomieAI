-- Setup storage bucket for cleaner images
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Create the storage bucket for cleaner images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cleaner-images',
    'cleaner-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- =====================================================
-- 2. CREATE RLS POLICIES FOR STORAGE
-- =====================================================

-- Policy: Allow authenticated users to upload cleaner images
CREATE POLICY "Authenticated users can upload cleaner images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'cleaner-images' 
        AND auth.uid() IS NOT NULL
    );

-- Policy: Allow authenticated users to update cleaner images
CREATE POLICY "Authenticated users can update cleaner images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'cleaner-images' 
        AND auth.uid() IS NOT NULL
    );

-- Policy: Allow authenticated users to delete cleaner images
CREATE POLICY "Authenticated users can delete cleaner images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'cleaner-images' 
        AND auth.uid() IS NOT NULL
    );

-- Policy: Allow public to view cleaner images
CREATE POLICY "Public can view cleaner images" ON storage.objects
    FOR SELECT USING (bucket_id = 'cleaner-images');

-- =====================================================
-- 3. UPDATE CLEANERS TABLE COLUMN
-- =====================================================

-- Update the image_url column to store file paths instead of URLs
-- This is already correct, but let's verify the column exists
ALTER TABLE public.cleaners 
ALTER COLUMN image_url TYPE VARCHAR(500);

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check storage bucket was created
SELECT * FROM storage.buckets WHERE id = 'cleaner-images';

-- Check storage policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%cleaner%';

-- Check cleaners table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'cleaners' AND column_name = 'image_url';

SELECT 'Cleaner images storage setup complete' as status;
