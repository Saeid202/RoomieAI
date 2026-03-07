-- SIMPLE CHECK: info@cargoplus.site landlord status
-- Only checks tables that exist in your database

-- ============================================
-- STEP 1: Find the user account
-- ============================================
SELECT 
  '=== USER ACCOUNT ===' as section,
  u.id as user_id,
  u.email,
  u.created_at as account_created,
  up.full_name,
  up.role,
  up.phone_number
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'info@cargoplus.site';

-- ============================================
-- STEP 2: Check ALL properties
-- ============================================
SELECT 
  '=== ALL PROPERTIES ===' as section,
  p.id,
  p.listing_title,
  p.city,
  p.state,
  p.monthly_rent,
  p.status,
  p.property_type,
  p.created_at,
  p.updated_at
FROM properties p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
ORDER BY p.created_at DESC;

-- ============================================
-- STEP 3: Count properties by status
-- ============================================
SELECT 
  '=== PROPERTY COUNTS ===' as section,
  p.status,
  COUNT(*) as count
FROM properties p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
GROUP BY p.status;

-- ============================================
-- STEP 4: Check for any rental applications
-- ============================================
SELECT 
  '=== RENTAL APPLICATIONS ===' as section,
  ra.id,
  ra.status,
  ra.full_name as applicant_name,
  ra.created_at,
  p.listing_title
FROM rental_applications ra
INNER JOIN properties p ON ra.property_id = p.id
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
ORDER BY ra.created_at DESC;

-- ============================================
-- STEP 5: Check for any lease contracts
-- ============================================
SELECT 
  '=== LEASE CONTRACTS ===' as section,
  lc.id,
  lc.status,
  lc.monthly_rent,
  lc.lease_start_date,
  lc.lease_end_date,
  lc.created_at,
  p.listing_title
FROM lease_contracts lc
INNER JOIN properties p ON lc.property_id = p.id
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
ORDER BY lc.created_at DESC;

-- ============================================
-- STEP 6: Summary
-- ============================================
SELECT 
  '=== SUMMARY ===' as section,
  (SELECT COUNT(*) FROM properties p INNER JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'info@cargoplus.site') as total_properties,
  (SELECT COUNT(*) FROM properties p INNER JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'info@cargoplus.site' AND p.status = 'active') as active_properties,
  (SELECT COUNT(*) FROM properties p INNER JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'info@cargoplus.site' AND p.status = 'inactive') as inactive_properties,
  (SELECT COUNT(*) FROM rental_applications ra INNER JOIN properties p ON ra.property_id = p.id INNER JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'info@cargoplus.site') as total_applications,
  (SELECT COUNT(*) FROM lease_contracts lc INNER JOIN properties p ON lc.property_id = p.id INNER JOIN auth.users u ON p.user_id = u.id WHERE u.email = 'info@cargoplus.site') as total_leases;
