-- Fix RLS policies for construction_products table

-- Drop existing policies
DROP POLICY IF EXISTS "suppliers_can_insert_products" ON public.construction_products;
DROP POLICY IF EXISTS "suppliers_can_update_own_products" ON public.construction_products;
DROP POLICY IF EXISTS "suppliers_can_delete_own_products" ON public.construction_products;

-- Create simpler, more reliable policies
CREATE POLICY "suppliers_can_insert_products" ON public.construction_products
    FOR INSERT WITH CHECK (
        supplier_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM public.construction_supplier_profiles WHERE id = auth.uid())
    );

CREATE POLICY "suppliers_can_update_own_products" ON public.construction_products
    FOR UPDATE USING (supplier_id = auth.uid())
    WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "suppliers_can_delete_own_products" ON public.construction_products
    FOR DELETE USING (supplier_id = auth.uid());

-- Also fix construction_product_images policies
DROP POLICY IF EXISTS "suppliers_can_manage_images" ON public.construction_product_images;

CREATE POLICY "suppliers_can_manage_images" ON public.construction_product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.construction_products 
            WHERE id = product_id AND supplier_id = auth.uid()
        )
    );

-- Fix construction_product_documents policies
DROP POLICY IF EXISTS "suppliers_can_manage_docs" ON public.construction_product_documents;

CREATE POLICY "suppliers_can_manage_docs" ON public.construction_product_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.construction_products 
            WHERE id = product_id AND supplier_id = auth.uid()
        )
    );

SELECT 'Construction RLS policies fixed' as status;
