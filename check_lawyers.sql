-- Check if any lawyers exist
SELECT 
  id,
  user_id,
  full_name,
  email,
  law_firm_name,
  created_at
FROM lawyer_profiles
ORDER BY created_at ASC
LIMIT 5;
