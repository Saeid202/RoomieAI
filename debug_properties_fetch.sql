-- Debug: Check if properties exist and their status
-- Run this in Supabase SQL Editor to see your properties

SELECT 
  id,
  user_id,
  address,
  title,
  city,
  province,
  status,
  created_at
FROM properties
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Check if any are archived
SELECT 
  status,
  COUNT(*) as count
FROM properties
WHERE user_id = auth.uid()
GROUP BY status;
