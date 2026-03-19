-- Diagnostic: Check supplier profiles and products relationship

-- 1. All supplier profiles
SELECT 'SUPPLIER_PROFILES' as section, id, company_name, created_at FROM construction_supplier_profiles;

-- 2. All products with their supplier info
SELECT 'PRODUCTS' as section, cp.id, cp.title, cp.supplier_id, csp.company_name, cp.status 
FROM construction_products cp
LEFT JOIN construction_supplier_profiles csp ON cp.supplier_id = csp.id;

-- 3. Check if supplier_id column exists and its type
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'construction_products' AND column_name = 'supplier_id';
