-- Check if bucket exists
SELECT id, name, public FROM storage.buckets WHERE name = 'property-documents';

-- Create the property-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket was created
SELECT id, name, public FROM storage.buckets WHERE name = 'property-documents';
