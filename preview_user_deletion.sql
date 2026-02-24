-- ============================================
-- PREVIEW USER DELETION
-- User: chinaplusgroup@gmail.com
-- ============================================
-- Run this FIRST to see what will be deleted
-- This is a READ-ONLY query that shows all data for this user

WITH user_info AS (
  SELECT id, email, created_at, last_sign_in_at
  FROM auth.users
  WHERE email = 'chinaplusgroup@gmail.com'
)
SELECT 
  'User Info' as table_name,
  u.id::text as record_id,
  u.email as details,
  u.created_at::text as created_at
FROM user_info u

UNION ALL

SELECT 
  'user_profiles' as table_name,
  up.id::text as record_id,
  CONCAT('Role: ', up.role, ', Name: ', up.full_name) as details,
  up.created_at::text as created_at
FROM user_profiles up
WHERE up.id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'mortgage_broker_profiles' as table_name,
  mbp.id::text as record_id,
  CONCAT('Company: ', mbp.company_name, ', License: ', mbp.license_number) as details,
  mbp.created_at::text as created_at
FROM mortgage_broker_profiles mbp
WHERE mbp.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'mortgage_profiles' as table_name,
  mp.id::text as record_id,
  CONCAT('Name: ', mp.full_name, ', Email: ', mp.email) as details,
  mp.created_at::text as created_at
FROM mortgage_profiles mp
WHERE mp.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'tenant_profiles' as table_name,
  tp.id::text as record_id,
  CONCAT('Name: ', tp.full_name) as details,
  tp.created_at::text as created_at
FROM tenant_profiles tp
WHERE tp.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'seeker_profiles' as table_name,
  sp.id::text as record_id,
  'Seeker profile exists' as details,
  sp.created_at::text as created_at
FROM seeker_profiles sp
WHERE sp.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'landlord_profiles' as table_name,
  lp.id::text as record_id,
  'Landlord profile exists' as details,
  lp.created_at::text as created_at
FROM landlord_profiles lp
WHERE lp.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'properties' as table_name,
  p.id::text as record_id,
  CONCAT('Address: ', p.address, ', Type: ', p.listing_category) as details,
  p.created_at::text as created_at
FROM properties p
WHERE p.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'rental_applications' as table_name,
  ra.id::text as record_id,
  CONCAT('Property ID: ', ra.property_id, ', Status: ', ra.status) as details,
  ra.created_at::text as created_at
FROM rental_applications ra
WHERE ra.user_id IN (SELECT id FROM user_info)

UNION ALL

SELECT 
  'document_access_requests' as table_name,
  dar.id::text as record_id,
  CONCAT('Property ID: ', dar.property_id, ', Status: ', dar.status) as details,
  dar.created_at::text as created_at
FROM document_access_requests dar
WHERE dar.requester_id IN (SELECT id FROM user_info)

ORDER BY table_name, created_at;

-- Summary count
SELECT 
  '========== DELETION SUMMARY ==========' as summary;

SELECT 
  'user_profiles' as table_name,
  COUNT(*) as records_to_delete
FROM user_profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'mortgage_broker_profiles' as table_name,
  COUNT(*) as records_to_delete
FROM mortgage_broker_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'mortgage_profiles' as table_name,
  COUNT(*) as records_to_delete
FROM mortgage_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'tenant_profiles' as table_name,
  COUNT(*) as records_to_delete
FROM tenant_profiles
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'properties' as table_name,
  COUNT(*) as records_to_delete
FROM properties
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'rental_applications' as table_name,
  COUNT(*) as records_to_delete
FROM rental_applications
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com')

UNION ALL

SELECT 
  'auth.users' as table_name,
  COUNT(*) as records_to_delete
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com'

ORDER BY table_name;
