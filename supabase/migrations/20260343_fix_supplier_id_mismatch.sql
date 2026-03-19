-- Fix supplier_id mismatch for products
-- This updates products where supplier_id doesn't match any construction_supplier_profiles
-- by assigning them to the first available supplier profile

UPDATE construction_products
SET supplier_id = (
  SELECT id FROM construction_supplier_profiles 
  LIMIT 1
)
WHERE supplier_id NOT IN (
  SELECT id FROM construction_supplier_profiles
);

-- Alternative: If you know the specific product title, update it directly
-- UPDATE construction_products
-- SET supplier_id = '<YOUR_USER_ID>'
-- WHERE title = 'Expandable house for 10ft';
