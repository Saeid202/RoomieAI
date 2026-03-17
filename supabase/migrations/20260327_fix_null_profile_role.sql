-- Fix null role in user_profiles by syncing from auth metadata
UPDATE public.user_profiles p
SET role = u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE p.id = u.id
  AND p.role IS NULL
  AND u.raw_user_meta_data->>'role' IS NOT NULL;
