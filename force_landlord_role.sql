-- Force your account back to landlord role
-- Replace with your actual email
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"landlord"'
)
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your actual email

-- Verify the change
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your actual email
