-- Fix the user_type mismatch for chinaplusgroup@gmail.com
-- This user is a landlord but user_type is set to tenant

UPDATE public.user_profiles
SET user_type = 'landlord'
WHERE email = 'chinaplusgroup@gmail.com';

-- Also update the full_name while we're at it
UPDATE public.user_profiles
SET full_name = 'China Plus Group'
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify the fix
SELECT id, email, role, user_type, full_name 
FROM user_profiles 
WHERE email = 'chinaplusgroup@gmail.com';
