-- Fix role for specific user chinaplusgroup@gmail.com
-- This script updates both the user_profiles table and auth.users metadata

-- 1. Update public.user_profiles
UPDATE public.user_profiles
SET role = 'landlord'
WHERE email = 'chinaplusgroup@gmail.com';

-- 2. Update auth.users metadata to ensure consistency
-- This ensures that next time they sign in, the metadata says 'landlord'
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "landlord"}'::jsonb
WHERE email = 'chinaplusgroup@gmail.com';

-- 3. Verify the change
SELECT id, email, role FROM public.user_profiles WHERE email = 'chinaplusgroup@gmail.com';
