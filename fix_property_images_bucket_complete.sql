-- Complete fix for property-images bucket and policies
-- Run this in Supabase SQL Editor

-- Step 1: Check if bucket exists, if not create it
DO $$
BEGIN
    -- Try to insert the bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'property-images',
        'property-images',
        true,
        10485760, -- 10MB
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    RAISE NOTICE 'Bucket property-images created or updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error with bucket: %', SQLERRM;
END $$;

-- Step 2: Drop all existing policies for property-images to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND (policyname ILIKE '%property%image%' OR policyname ILIKE '%property-images%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 3: Create new comprehensive policies

-- Allow authenticated users to upload to property-images bucket
CREATE POLICY "property_images_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-images'
);

-- Allow public to view property images
CREATE POLICY "property_images_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'property-images'
);

-- Allow users to delete their own property images
CREATE POLICY "property_images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own property images
CREATE POLICY "property_images_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 4: Verify the setup
SELECT '=== BUCKET CONFIGURATION ===' as info;
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets
WHERE name = 'property-images';

SELECT '=== STORAGE POLICIES ===' as info;
SELECT 
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE 'property_images%'
ORDER BY cmd, policyname;

SELECT '=== SETUP COMPLETE ===' as info;
