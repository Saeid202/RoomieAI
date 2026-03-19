-- Add custom_build_enabled column to construction_products
ALTER TABLE construction_products ADD COLUMN custom_build_enabled BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN construction_products.custom_build_enabled IS 'Whether seller has enabled the "Begin Live Factory Custom Build" option';
