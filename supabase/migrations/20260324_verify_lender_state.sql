-- Run this to verify the current state of lender2026@hotmail.com
-- Check user_profiles
SELECT id, email, role, full_name 
FROM public.user_profiles 
WHERE email = 'lender2026@hotmail.com';

-- Check auth.users metadata
SELECT id, email, raw_user_meta_data->>'role' as metadata_role
FROM auth.users 
WHERE email = 'lender2026@hotmail.com';

-- Check lender_profiles
SELECT lp.user_id, lp.company_name, lp.contact_email
FROM public.lender_profiles lp
JOIN public.user_profiles up ON up.id = lp.user_id
WHERE up.email = 'lender2026@hotmail.com';
