-- Diagnostic query to find products with supplier_id mismatches
-- Run this to see which products exist but aren't visible to their creators

SELECT 
  cp.id,
  cp.title,
  cp.supplier_id,
  cp.status,
  cp.created_at,
  csp.company_name,
  csp.id as profile_id
FROM construction_products cp
LEFT JOIN construction_supplier_profiles csp ON cp.supplier_id = csp.id
ORDER BY cp.created_at DESC;
