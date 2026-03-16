-- Consolidate construction product categories from 6 to 2
-- Old: expandable, foldable, flatpack, capsule, modular, cabinet
-- New: house, cabinet

-- Step 1: Drop old CHECK constraint
ALTER TABLE public.construction_products
  DROP CONSTRAINT IF EXISTS construction_products_product_type_check;

-- Step 2: Migrate existing data BEFORE adding new constraint
UPDATE public.construction_products
  SET product_type = 'house'
  WHERE product_type IN ('expandable', 'foldable', 'flatpack', 'capsule', 'modular');

-- Step 3: Add new CHECK constraint
ALTER TABLE public.construction_products
  ADD CONSTRAINT construction_products_product_type_check
  CHECK (product_type IN ('house', 'cabinet'));

-- Verify
SELECT id, title, product_type FROM public.construction_products;
