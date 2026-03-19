-- This migration ensures that if a product exists without a matching supplier profile,
-- we can identify and fix it

-- First, let's see which products have supplier_ids that don't match any profile
SELECT 
  cp.id as product_id,
  cp.title,
  cp.supplier_id,
  csp.id as profile_id
FROM construction_products cp
LEFT JOIN construction_supplier_profiles csp ON cp.supplier_id = csp.id
WHERE csp.id IS NULL;
