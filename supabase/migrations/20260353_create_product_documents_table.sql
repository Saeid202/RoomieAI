-- Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS public.construction_product_documents CASCADE;

-- Create construction_product_documents table
CREATE TABLE public.construction_product_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for now (consistent with other construction tables)
ALTER TABLE public.construction_product_documents DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_construction_product_documents_product_id ON public.construction_product_documents(product_id);
CREATE INDEX idx_construction_product_documents_user_id ON public.construction_product_documents(user_id);
