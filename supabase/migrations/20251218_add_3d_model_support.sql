
-- Add 3D model support to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS three_d_model_url TEXT;

-- We can re-use the 'property-images' or 'property-audio' bucket, 
-- or create a specific 'property-3d' bucket if we expect large files.
-- For now, let's create a specific one to be clean.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-3d', 'property-3d', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read
CREATE POLICY "Give public access to property-3d" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-3d');

-- Policy: Auth Insert (Landlords)
CREATE POLICY "Enable insert for authenticated users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-3d' AND auth.role() = 'authenticated');

-- Policy: Owner Update/Delete
CREATE POLICY "Enable update/delete for users based on user_id" ON storage.objects
  FOR ALL USING (
    bucket_id = 'property-3d' 
    AND (auth.uid() = owner OR (storage.foldername(name))[1] = auth.uid()::text)
  );
