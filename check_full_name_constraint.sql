-- Check if full_name has a NOT NULL constraint
SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
  AND column_name IN ('full_name', 'role')
ORDER BY column_name;
