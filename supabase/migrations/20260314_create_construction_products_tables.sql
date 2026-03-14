-- Phase 2: Construction Products Tables
-- This migration creates the tables for construction supplier product management

-- ============================================
-- TABLE 1: construction_products
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.construction_supplier_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price_cad NUMERIC NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('expandable', 'foldable', 'flatpack', 'capsule', 'modular')),
    size_ft TEXT,
    bedrooms TEXT,
    bathrooms TEXT,
    area_sqm NUMERIC,
    lead_time TEXT,
    frame_type TEXT,
    shipping_port TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: construction_product_images
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: construction_product_documents
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_product_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('brochure', 'spec_sheet', 'floor_plan', 'compliance', 'install_guide')),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_kb INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 4: construction_customization_options
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_customization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL CHECK (option_type IN ('exterior_colour', 'interior_finish', 'dimensions', 'rooms', 'windows', 'door', 'roofing', 'insulation', 'solar', 'flooring')),
    option_value TEXT NOT NULL,
    hex_code TEXT,
    price_modifier NUMERIC DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE public.construction_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_customization_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for construction_products
-- ============================================
-- SELECT: supplier can only see their own products
CREATE POLICY "suppliers_can_select_own_products" ON public.construction_products
    FOR SELECT
    USING (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- INSERT: authenticated construction suppliers can insert
CREATE POLICY "suppliers_can_insert_products" ON public.construction_products
    FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- UPDATE: supplier can only update their own products
CREATE POLICY "suppliers_can_update_own_products" ON public.construction_products
    FOR UPDATE
    USING (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    WITH CHECK (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- DELETE: supplier can only delete their own products
CREATE POLICY "suppliers_can_delete_own_products" ON public.construction_products
    FOR DELETE
    USING (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- ============================================
-- RLS Policies for construction_product_images
-- ============================================
-- SELECT: supplier can see images of their own products
CREATE POLICY "suppliers_can_select_own_images" ON public.construction_product_images
    FOR SELECT
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- INSERT: supplier can insert images for their own products
CREATE POLICY "suppliers_can_insert_images" ON public.construction_product_images
    FOR INSERT
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- UPDATE: supplier can update images of their own products
CREATE POLICY "suppliers_can_update_own_images" ON public.construction_product_images
    FOR UPDATE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    )
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- DELETE: supplier can delete images of their own products
CREATE POLICY "suppliers_can_delete_own_images" ON public.construction_product_images
    FOR DELETE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- ============================================
-- RLS Policies for construction_product_documents
-- ============================================
-- SELECT: supplier can see documents of their own products
CREATE POLICY "suppliers_can_select_own_documents" ON public.construction_product_documents
    FOR SELECT
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- INSERT: supplier can insert documents for their own products
CREATE POLICY "suppliers_can_insert_documents" ON public.construction_product_documents
    FOR INSERT
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- UPDATE: supplier can update documents of their own products
CREATE POLICY "suppliers_can_update_own_documents" ON public.construction_product_documents
    FOR UPDATE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    )
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- DELETE: supplier can delete documents of their own products
CREATE POLICY "suppliers_can_delete_own_documents" ON public.construction_product_documents
    FOR DELETE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- ============================================
-- RLS Policies for construction_customization_options
-- ============================================
-- SELECT: supplier can see options of their own products
CREATE POLICY "suppliers_can_select_own_options" ON public.construction_customization_options
    FOR SELECT
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- INSERT: supplier can insert options for their own products
CREATE POLICY "suppliers_can_insert_options" ON public.construction_customization_options
    FOR INSERT
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- UPDATE: supplier can update options of their own products
CREATE POLICY "suppliers_can_update_own_options" ON public.construction_customization_options
    FOR UPDATE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    )
    WITH CHECK (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- DELETE: supplier can delete options of their own products
CREATE POLICY "suppliers_can_delete_own_options" ON public.construction_customization_options
    FOR DELETE
    USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    );

-- ============================================
-- Create function to auto-generate slug
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_product_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        trim(title),
                        '[^a-zA-Z0-9\s]', '', 'g'
                    ),
                    '\s+', '-', 'g'
                ),
                '^-+|-+$', '', 'g'
            ),
            '-+', '-', 'g'
        )
    ) || '-' || substring(md5(random()::text) from 1 for 6);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Create index for faster queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_construction_products_supplier_id ON public.construction_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_construction_products_status ON public.construction_products(status);
CREATE INDEX IF NOT EXISTS idx_construction_product_images_product_id ON public.construction_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_construction_product_documents_product_id ON public.construction_product_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_construction_customization_options_product_id ON public.construction_customization_options(product_id);

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Phase 2 tables created successfully' as status;