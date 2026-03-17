-- Disable trigger to avoid duplicate lender_profiles error
ALTER TABLE public.user_profiles DISABLE TRIGGER create_lender_profile_on_user_profile_insert;

-- Insert with all NOT NULL columns satisfied
INSERT INTO public.user_profiles (
  id, email, full_name, role,
  contact_street_number, contact_street_name,
  contact_city_town, contact_province, contact_postal_code,
  created_at, updated_at
)
VALUES (
  'e5406cb2-6fbd-427e-8c73-c4298be3c08b',
  'lender2026@hotmail.com',
  'Lender User',
  'lender',
  '', '', '', '', '',
  NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'lender';

-- Re-enable trigger
ALTER TABLE public.user_profiles ENABLE TRIGGER create_lender_profile_on_user_profile_insert;

-- Verify
SELECT id, email, role FROM public.user_profiles
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';
