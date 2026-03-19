-- Create storage bucket for construction product documents
-- Note: RLS policies must be configured in Supabase dashboard or via admin API
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'construction-product-documents',
  'construction-product-documents',
  true,
  null,
  null
)
ON CONFLICT (id) DO NOTHING;
