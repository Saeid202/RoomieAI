-- Bypass RLS to directly update the role
-- Run as service role / postgres superuser in Supabase SQL editor

-- Temporarily disable RLS on user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Update the role
UPDATE public.user_profiles
SET role = 'lender'
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT id, email, role FROM public.user_profiles
WHERE id = 'e5406cb2-6fbd-427e-8c73-c4298be3c08b';
