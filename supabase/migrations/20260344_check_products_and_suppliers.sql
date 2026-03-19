-- Check all products and their suppliers
SELECT 
  cp.id as product_id,
  cp.title,
  cp.supplier_id,
  cp.status,
  csp.id as supplier_profile_id,
  csp.user_id,
  csp.company_name
FROM construction_products cp
LEFT JOIN construction_supplier_profiles csp ON cp.supplier_id = csp.id
ORDER BY cp.created_at DESC;
