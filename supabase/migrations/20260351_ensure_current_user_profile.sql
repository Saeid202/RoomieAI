-- Ensure supplier profile exists for all construction_supplier users
-- This is a safety net in case the trigger didn't fire

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

-- Verify the result
SELECT COUNT(*) as total_profiles FROM public.construction_supplier_profiles;
