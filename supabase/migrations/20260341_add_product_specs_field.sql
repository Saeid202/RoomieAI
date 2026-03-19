-- Add product_specs field to construction_products table
ALTER TABLE construction_products
ADD COLUMN product_specs TEXT;

COMMENT ON COLUMN construction_products.product_specs IS 'Dynamic trust line / product specs entered by seller (e.g., "German-inspired precision • FSC-certified • Lifetime warranty")';
