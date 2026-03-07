-- Fix image deletion policy for property-images bucket
-- Run this in Supabase SQL Editor if you're getting permission errors

-- Step 1: Drop existing DELETE policies to avoid conflicts
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "property_images_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete property images" ON storage.objects;

-- Step 2: Create a comprehensive DELETE policy
-- This allows authenticated users to delete images from their own folder
CREATE POLICY "property_images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 3: Verify the policy was created
SELECT 
  policyname,
  cmd as operation,
  roles,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND cmd = 'DELETE'
  AND policyname ILIKE '%property%image%';

-- Step 4: Test with current user
SELECT 
  'Current user ID: ' || auth.uid()::text as info,
  'Can delete from property-images: ' || 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND cmd = 'DELETE'
        AND policyname ILIKE '%property%image%'
    ) THEN 'YES'
    ELSE 'NO'
  END as can_delete;
