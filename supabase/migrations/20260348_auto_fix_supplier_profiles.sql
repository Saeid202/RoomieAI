-- Automated fix for supplier profile and product ownership issues

-- Step 1: Ensure all users with construction_supplier role have a profile
INSERT INTO public.construction_supplier_profiles (id, company_name, contact_name, email, phone, verified)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'company_name', 'Unknown Company'),
  COALESCE(u.raw_user_meta_data->>'contact_name', 'Unknown Contact'),
  u.email,
  u.raw_user_meta_data->>'phone',
  FALSE
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'construction_supplier'
  AND u.id NOT IN (SELECT id FROM public.construction_supplier_profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Fix orphaned products (supplier_id doesn't exist in profiles)
-- Assign them to the first available supplier profile
UPDATE public.construction_products
SET supplier_id = (
  SELECT id FROM public.construction_supplier_profiles 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE supplier_id NOT IN (
  SELECT id FROM public.construction_supplier_profiles
)
AND supplier_id IS NOT NULL;

-- Step 3: Log the results
SELECT 
  'FIXED' as status,
  COUNT(*) as total_products,
  COUNT(CASE WHEN status = 'live' THEN 1 END) as live_products,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_products
FROM public.construction_products;
