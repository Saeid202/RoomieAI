-- Direct fix using the known user ID
UPDATE public.user_profiles
SET role = 'lender'
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';

-- If no row exists, insert one
INSERT INTO public.user_profiles (id, email, role, full_name)
VALUES (
  'e5406cb2-6fbd-427e-8c73-c4298be3c08b',
  'lender2026@hotmail.com',
  'lender',
  'Lender User'
)
ON CONFLICT (id) DO UPDATE SET role = 'lender';

-- Verify
SELECT id, email, role FROM public.user_profiles
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';
