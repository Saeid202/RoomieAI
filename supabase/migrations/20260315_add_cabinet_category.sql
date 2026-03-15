-- Add Cabinet Category Support
-- Updates product_type constraint to include 'cabinet'

-- Drop existing constraint
ALTER TABLE public.construction_products 
DROP CONSTRAINT IF EXISTS construction_products_product_type_check;

-- Add new constraint with cabinet option
ALTER TABLE public.construction_products 
ADD CONSTRAINT construction_products_product_type_check 
CHECK (product_type IN ('expandable', 'foldable', 'flatpack', 'capsule', 'modular', 'cabinet'));

-- Update indexes if needed (cabinet will use same indexes as modular)
CREATE INDEX IF NOT EXISTS idx_construction_products_product_type ON public.construction_products(product_type);
