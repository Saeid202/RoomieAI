-- Add audio URL column to properties table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description_audio_url') THEN
        ALTER TABLE properties ADD COLUMN description_audio_url TEXT;
    END IF;
END $$;

-- Create storage bucket for audio if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-audio', 'property-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the bucket
-- Note: 'storage.objects' RLS is usually globally enabled, we just need policies.

-- Policy: Public Read Access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access Audio" ON storage.objects;
    CREATE POLICY "Public Access Audio"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'property-audio' );
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Policy: Authenticated users can upload audio files
-- They can upload to any path in this bucket for now, or restrict to their user_id folder
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated Upload Audio" ON storage.objects;
    CREATE POLICY "Authenticated Upload Audio"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'property-audio' );
END $$;

-- Policy: Users can update/delete their own audio (based on user_id folder convention if emphasized, or simplified owner check if tracking metadata)
-- For simplicity in this robust migration, as audio is usually write-once or overwrite by creator.
-- We will allow authenticated users to delete/update files in this bucket corresponding to their ownership.
-- A common pattern is storing as `user_id/file.mp3`.
-- Let's assume the upload path will include the user_id as the first path segment.

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users Update Own Audio" ON storage.objects;
    CREATE POLICY "Users Update Own Audio"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING ( bucket_id = 'property-audio' AND auth.uid()::text = (storage.foldername(name))[1] );
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users Delete Own Audio" ON storage.objects;
    CREATE POLICY "Users Delete Own Audio"
    ON storage.objects FOR DELETE
    TO authenticated
    USING ( bucket_id = 'property-audio' AND auth.uid()::text = (storage.foldername(name))[1] );
END $$;
