-- SIMPLE: Create a platform lawyer using an existing user
-- 
-- STEP 1: Find a user to make a lawyer (run this first)
SELECT id, email, raw_user_meta_data->>'full_name' as name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- STEP 2: Copy a user ID from above and paste it below
-- Replace 'PASTE_USER_ID_HERE' with actual UUID

INSERT INTO lawyer_profiles (
  user_id,
  full_name,
  email,
  law_firm_name,
  practice_areas,
  years_of_experience,
  bio,
  city,
  province,
  is_accepting_clients
)
VALUES (
  'PASTE_USER_ID_HERE',  -- REPLACE THIS
  'John Smith',
  'john.smith@lawfirm.com',
  'Smith & Partners LLP',
  ARRAY['Real Estate', 'Property Law'],
  10,
  'Experienced real estate lawyer',
  'Toronto',
  'ON',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  law_firm_name = EXCLUDED.law_firm_name;

-- STEP 3: Verify
SELECT * FROM lawyer_profiles ORDER BY created_at DESC LIMIT 1;
