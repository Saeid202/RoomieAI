-- Comprehensive diagnostic to understand the supplier/product mismatch

-- 1. Check all supplier profiles
SELECT 'SUPPLIER PROFILES' as section, id, user_id, company_name, created_at FROM construction_supplier_profiles;

-- 2. Check all products and their suppliers
SELECT 'PRODUCTS' as section, cp.id, cp.title, cp.supplier_id, csp.company_name, cp.status FROM construction_products cp
LEFT JOIN construction_supplier_profiles csp ON cp.supplier_id = csp.id;

-- 3. Check for orphaned products (supplier_id doesn't exist)
SELECT 'ORPHANED PRODUCTS' as section, cp.id, cp.title, cp.supplier_id FROM construction_products cp
WHERE cp.supplier_id NOT IN (SELECT id FROM construction_supplier_profiles);
