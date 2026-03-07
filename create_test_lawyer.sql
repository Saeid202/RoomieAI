-- Create a test platform lawyer
-- Run this if you don't have any lawyers in the system

-- First, check if you have a user account you want to make a lawyer
-- Replace 'YOUR_EMAIL@example.com' with an actual user email

-- Option 1: Create lawyer profile for existing user
INSERT INTO lawyer_profiles (
  user_id,
  full_name,
  email,
  law_firm_name,
  bar_association_number,
  practice_areas,
  years_of_experience,
  hourly_rate,
  consultation_fee,
  bio,
  city,
  province,
  is_accepting_clients
)
SELECT 
  id as user_id,
  'John Smith' as full_name,
  email,
  'Smith & Partners LLP' as law_firm_name,
  'BAR-12345' as bar_association_number,
  ARRAY['Real Estate', 'Property Law', 'Contract Law'] as practice_areas,
  10 as years_of_experience,
  350.00 as hourly_rate,
  150.00 as consultation_fee,
  'Experienced real estate lawyer specializing in property transactions and contract law.' as bio,
  'Toronto' as city,
  'ON' as province,
  true as is_accepting_clients
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'  -- REPLACE THIS WITH YOUR LAWYER USER EMAIL
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

-- Verify it was created
SELECT 
  id,
  user_id,
  full_name,
  email,
  law_firm_name
FROM lawyer_profiles
ORDER BY created_at DESC
LIMIT 1;
