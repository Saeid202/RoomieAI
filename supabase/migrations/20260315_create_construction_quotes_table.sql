-- Phase 3: Construction Quotes Table
-- This migration creates the quotes table for buyer requests

-- ============================================
-- Add badge_label column to construction_products
-- ============================================
ALTER TABLE public.construction_products
ADD COLUMN IF NOT EXISTS badge_label TEXT;

-- ============================================
-- TABLE: construction_quotes
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.construction_products(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES public.construction_supplier_profiles(id) ON DELETE CASCADE,
    order_type TEXT NOT NULL CHECK (order_type IN ('catalogue', 'custom')),
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    province TEXT NOT NULL,
    selected_options JSONB,
    custom_width_ft NUMERIC,
    custom_length_ft NUMERIC,
    budget_range TEXT,
    message TEXT,
    floor_plan_path TEXT,
    inspiration_photos_paths JSONB,
    thread_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.construction_quotes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for construction_quotes
-- ============================================
-- INSERT: Public (no auth required)
CREATE POLICY "public_can_insert_quotes" ON public.construction_quotes
    FOR INSERT
    WITH CHECK (true);

-- SELECT: Supplier can only see their own quotes
CREATE POLICY "suppliers_can_select_own_quotes" ON public.construction_quotes
    FOR SELECT
    USING (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- UPDATE: Supplier can only update their own quotes
CREATE POLICY "suppliers_can_update_own_quotes" ON public.construction_quotes
    FOR UPDATE
    USING (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()))
    WITH CHECK (supplier_id IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

-- ============================================
-- Create indexes for faster queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_construction_quotes_supplier_id ON public.construction_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_product_id ON public.construction_quotes(product_id);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_thread_token ON public.construction_quotes(thread_token);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_status ON public.construction_quotes(status);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_created_at ON public.construction_quotes(created_at DESC);

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Phase 3 quotes table created successfully' as status;