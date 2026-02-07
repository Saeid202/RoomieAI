-- Fix critical database errors causing 500 and 404 responses
-- Run this script in your Supabase SQL editor

-- 1. FIX USER_PROFILES TABLE STRUCTURE AND RLS
-- =============================================

-- First, ensure the role column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'seeker';
        RAISE NOTICE 'Added role column to user_profiles';
    END IF;
END $$;

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in conversations" ON public.user_profiles;
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.user_profiles;

-- Create clean, simple RLS policies
CREATE POLICY "Enable read access for all users based on user_id" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Enable insert for authenticated users only" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Enable update for users based on user_id" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Enable delete for users based on user_id" ON public.user_profiles
    FOR DELETE USING (auth.uid() = id OR auth.role() = 'service_role');

-- 2. CREATE USER_CONSENTS TABLE
-- ===========================

-- Create the missing user_consents table
CREATE TABLE IF NOT EXISTS public.user_consents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type text NOT NULL,
    granted boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    source text DEFAULT 'digital_wallet'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_consents_user_type ON public.user_consents(user_id, consent_type);

-- Enable RLS on user_consents
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_consents
CREATE POLICY "Users can view own consents" ON public.user_consents
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own consents" ON public.user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own consents" ON public.user_consents
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can delete own consents" ON public.user_consents
    FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 3. GRANT PERMISSIONS
-- ===================

-- Grant permissions on user_profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions on user_consents
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_consents TO authenticated;
GRANT SELECT ON public.user_consents TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. VERIFY SETUP
-- ===============

-- Check tables exist
SELECT 
    'user_profiles' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') as exists
UNION ALL
SELECT 
    'user_consents' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_consents') as exists;

-- Check columns in user_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_consents')
ORDER BY tablename, policyname;
