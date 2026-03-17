-- Fix lender2026@hotmail.com user role from seeker to lender
-- This user signed up as a lender but the role wasn't stored correctly

-- First, update the user_profiles role
UPDATE public.user_profiles
SET role = 'lender'
WHERE email = 'lender2026@hotmail.com' AND role = 'seeker';

-- Then, create the lender_profiles record if it doesn't exist
INSERT INTO public.lender_profiles (user_id, company_name, contact_email)
SELECT 
  id,
  COALESCE(full_name, 'Lender Company'),
  COALESCE(email, '')
FROM public.user_profiles
WHERE email = 'lender2026@hotmail.com' AND role = 'lender'
ON CONFLICT (user_id) DO NOTHING;
