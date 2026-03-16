-- Fix 1: Add badge_label column if it doesn't exist
ALTER TABLE public.construction_products
  ADD COLUMN IF NOT EXISTS badge_label TEXT;

-- Fix 2: Drop the old product_type CHECK constraint and add one that includes 'cabinet'
ALTER TABLE public.construction_products
  DROP CONSTRAINT IF EXISTS construction_products_product_type_check;

ALTER TABLE public.construction_products
  ADD CONSTRAINT construction_products_product_type_check
  CHECK (product_type IN ('expandable', 'foldable', 'flatpack', 'capsule', 'modular', 'cabinet'));

-- Fix 3: Make all existing products live so they show up on the public page
UPDATE public.construction_products
  SET status = 'live'
  WHERE status = 'draft';

-- Fix 4: Add badge labels for common product types (optional but recommended)
UPDATE public.construction_products
  SET badge_label = 'In Stock'
  WHERE badge_label IS NULL;

-- Fix 5: Ensure RLS is disabled on construction tables (for testing)
ALTER TABLE public.construction_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_supplier_profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT id, title, slug, status, product_type, badge_label FROM public.construction_products;
