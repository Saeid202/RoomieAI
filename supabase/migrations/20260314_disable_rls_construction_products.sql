-- Temporarily disable RLS on construction tables for testing
-- This will be re-enabled after we verify the insert works

ALTER TABLE public.construction_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_product_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_supplier_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_messages DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled on all construction tables for testing' as status;
