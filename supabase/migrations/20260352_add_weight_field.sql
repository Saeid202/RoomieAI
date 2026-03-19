-- Add weight field to construction_products table
ALTER TABLE public.construction_products
ADD COLUMN IF NOT EXISTS weight_kg TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.construction_products.weight_kg IS 'Product weight in kilograms (e.g., "2500 kg", "3 tons")';
