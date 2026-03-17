-- Disable the trigger that causes the duplicate error
ALTER TABLE public.user_profiles DISABLE TRIGGER create_lender_profile_on_user_profile_insert;

-- Insert the user_profiles row
INSERT INTO public.user_profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
  'e5406cb2-6fbd-427e-8c73-c4298be3c08b',
  'lender2026@hotmail.com',
  'lender',
  'Lender User',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'lender';

-- Re-enable the trigger
ALTER TABLE public.user_profiles ENABLE TRIGGER create_lender_profile_on_user_profile_insert;

-- Verify both tables
SELECT id, email, role FROM public.user_profiles
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';

SELECT user_id, company_name FROM public.lender_profiles
WHERE user_id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';
