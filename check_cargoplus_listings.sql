-- Check if info@cargoplus.site has any property listings

-- First, find the user ID for this email
SELECT 
  u.id as user_id,
  u.email,
  up.full_name,
  up.role
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'info@cargoplus.site';

-- Then check their properties
SELECT 
  p.id,
  p.listing_title,
  p.city,
  p.state,
  p.monthly_rent,
  p.status,
  p.property_type,
  p.created_at
FROM properties p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
ORDER BY p.created_at DESC;

-- Count total properties
SELECT COUNT(*) as total_properties
FROM properties p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site';
