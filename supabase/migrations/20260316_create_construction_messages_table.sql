-- Phase 4: Construction Messages Table
-- This migration creates the messages table for quote communication

-- ============================================
-- TABLE: construction_messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.construction_quotes(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'supplier')),
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable RLS
-- ============================================
ALTER TABLE public.construction_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for construction_messages
-- ============================================
-- INSERT: Public (buyer has no account)
CREATE POLICY "public_can_insert_messages" ON public.construction_messages
    FOR INSERT
    WITH CHECK (true);

-- SELECT: Supplier can see messages in their quotes
CREATE POLICY "suppliers_can_select_messages" ON public.construction_messages
    FOR SELECT
    USING (
        quote_id IN (
            SELECT id FROM public.construction_quotes 
            WHERE supplier_id = auth.uid()
        )
    );

-- UPDATE: Supplier can mark messages as read
CREATE POLICY "suppliers_can_update_messages" ON public.construction_messages
    FOR UPDATE
    USING (
        quote_id IN (
            SELECT id FROM public.construction_quotes 
            WHERE supplier_id = auth.uid()
        )
    )
    WITH CHECK (
        quote_id IN (
            SELECT id FROM public.construction_quotes 
            WHERE supplier_id = auth.uid()
        )
    );

-- ============================================
-- Update construction_quotes RLS
-- ============================================
-- Add policy for buyer access via thread_token
CREATE POLICY "public_can_select_by_thread_token" ON public.construction_quotes
    FOR SELECT
    USING (true);

-- ============================================
-- Create indexes for faster queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_construction_messages_quote_id ON public.construction_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_construction_messages_sender_type ON public.construction_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_construction_messages_read ON public.construction_messages(read);
CREATE INDEX IF NOT EXISTS idx_construction_messages_created_at ON public.construction_messages(created_at DESC);

-- ============================================
-- Verify setup
-- ============================================
SELECT 'Phase 4 messages table created successfully' as status;