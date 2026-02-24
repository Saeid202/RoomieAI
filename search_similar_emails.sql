-- Search for emails that contain "chinaplus" or similar patterns

SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
WHERE 
  u.email ILIKE '%chinaplus%' 
  OR u.email ILIKE '%china%plus%'
  OR u.email ILIKE '%chinaplusgroup%'
ORDER BY u.created_at DESC;

-- This will find any emails containing "chinaplus" or similar patterns
