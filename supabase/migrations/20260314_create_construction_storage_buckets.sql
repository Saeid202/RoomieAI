-- Phase 2: Storage Buckets for Construction Products
-- This migration creates the storage buckets for product images and documents

-- ============================================
-- Create construction-images bucket (public)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-images', 'construction-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Create construction-documents bucket (private)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('construction-documents', 'construction-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for construction-images (public)
-- ============================================
-- Allow public read access to images
CREATE POLICY "public_can_view_images" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'construction-images'
    );

-- Allow authenticated suppliers to upload images
CREATE POLICY "suppliers_can_upload_images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'construction-images' AND
        auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- Allow suppliers to update their own images
CREATE POLICY "suppliers_can_update_own_images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'construction-images' AND
        (SELECT supplier_id FROM public.construction_products WHERE id::text = (storage.foldername(name))[1]) = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'construction-images' AND
        auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- Allow suppliers to delete their own images
CREATE POLICY "suppliers_can_delete_own_images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'construction-images' AND
        (SELECT supplier_id FROM public.construction_products WHERE id::text = (storage.foldername(name))[1]) = auth.uid()
    );

-- ============================================
-- Storage Policies for construction-documents (private)
-- ============================================
-- Allow suppliers to view their own documents
CREATE POLICY "suppliers_can_view_documents" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'construction-documents' AND
        (SELECT supplier_id FROM public.construction_products WHERE id::text = (storage.foldername(name))[1]) = auth.uid()
    );

-- Allow authenticated suppliers to upload documents
CREATE POLICY "suppliers_can_upload_documents" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'construction-documents' AND
        auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- Allow suppliers to update their own documents
CREATE POLICY "suppliers_can_update_own_documents" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'construction-documents' AND
        (SELECT supplier_id FROM public.construction_products WHERE id::text = (storage.foldername(name))[1]) = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'construction-documents' AND
        auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- Allow suppliers to delete their own documents
CREATE POLICY "suppliers_can_delete_own_documents" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'construction-documents' AND
        (SELECT supplier_id FROM public.construction_products WHERE id::text = (storage.foldername(name))[1]) = auth.uid()
    );

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Construction storage buckets created successfully' as status;