-- Comprehensive Fix Script: Sync Profiles and Roles
-- Run this in the Supabase SQL Editor

-- 1. Ensure the 'role' column exists in user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'seeker';
    END IF;
END $$;

-- 2. Sync any users that exist in Auth but are missing from public.user_profiles
INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name', 
        au.raw_user_meta_data->>'name', 
        au.raw_user_meta_data->>'display_name',
        'User'
    ) as full_name,
    COALESCE(
        au.raw_user_meta_data->>'role', 
        'seeker'
    ) as role,
    au.created_at,
    COALESCE(au.updated_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- 3. Force the specific role for chinaplusgroup@gmail.com
UPDATE public.user_profiles
SET role = 'landlord'
WHERE email = 'chinaplusgroup@gmail.com';

-- 4. Verify the results
SELECT id, email, role, full_name FROM public.user_profiles WHERE email = 'chinaplusgroup@gmail.com';
