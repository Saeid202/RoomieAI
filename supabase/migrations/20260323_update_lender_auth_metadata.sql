-- Update auth metadata for lender2026@hotmail.com to have role='lender'
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lender"'::jsonb
)
WHERE email = 'lender2026@hotmail.com';
