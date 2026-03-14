-- Phase 3: Buyer Uploads Storage Bucket
-- This migration creates the private bucket for buyer file uploads

-- ============================================
-- Create construction-buyer-uploads bucket (private)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-buyer-uploads', 'construction-buyer-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for construction-buyer-uploads (private)
-- ============================================
-- Allow public upload (no auth required - buyers have no account)
CREATE POLICY "public_can_upload_files" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'construction-buyer-uploads'
    );

-- Allow public to view their own files via signed URL
CREATE POLICY "public_can_view_own_files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'construction-buyer-uploads'
    );

-- Allow suppliers to view files in their quotes
CREATE POLICY "suppliers_can_view_quote_files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'construction-buyer-uploads' AND
        (storage.foldername(name))[1] IN (
            SELECT thread_token::text FROM public.construction_quotes 
            WHERE supplier_id = auth.uid()
        )
    );

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Buyer uploads bucket created successfully' as status;