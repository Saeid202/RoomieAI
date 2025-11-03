-- Simple storage setup - run this in Supabase SQL Editor
-- This will create the storage bucket with minimal configuration

-- Create the property-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Verify the bucket was created
SELECT 'Storage bucket setup completed' as status;
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'property-images';
