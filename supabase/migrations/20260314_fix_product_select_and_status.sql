-- Fix 1: Allow anyone to SELECT any construction product (not just live ones)
-- This is needed for the public detail page to work
DROP POLICY IF EXISTS "public_can_view_live_products" ON public.construction_products;

CREATE POLICY "public_can_view_all_products" ON public.construction_products
    FOR SELECT USING (true);

-- Fix 2: Make all existing products live so they show up
UPDATE public.construction_products SET status = 'live';

SELECT id, title, slug, status FROM public.construction_products;
