-- The user_profiles row doesn't exist - insert it directly
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

-- Verify
SELECT id, email, role FROM public.user_profiles
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';
