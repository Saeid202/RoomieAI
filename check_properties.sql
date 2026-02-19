-- Check all properties in the database
SELECT 
  id, 
  listing_title, 
  status, 
  user_id,
  city,
  state,
  monthly_rent,
  created_at
FROM properties 
ORDER BY created_at DESC;

-- Count properties by status
SELECT 
  status, 
  COUNT(*) as count 
FROM properties 
GROUP BY status;

-- Check if you're logged in and get your user_id
SELECT 
  id as your_user_id,
  email
FROM auth.users
WHERE id = auth.uid();
