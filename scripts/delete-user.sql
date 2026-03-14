-- Run this in Supabase Dashboard → SQL Editor
-- This deletes the user 'homiecontractor@hotmail.com' from auth

-- Step 1: Find and delete the user from auth.users
-- (This will cascade-delete from any related tables with FK constraints)
DELETE FROM auth.users 
WHERE email = 'homiecontractor@hotmail.com';

-- After running this, you can sign up again with the same email.
-- 
-- ALSO RECOMMENDED: Disable email confirmation for development:
-- Go to Authentication → Providers → Email → Turn off "Confirm email"
