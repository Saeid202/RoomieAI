-- EMERGENCY FIX - Run this RIGHT NOW in Supabase SQL Editor
-- This will fix your lawyer role issue immediately

-- Step 1: Check if user_profiles table exists and has the right structure
DO $$
BEGIN
  -- Check if user_profiles table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    -- Create user_profiles table if it doesn't exist
    CREATE TABLE public.user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role user_role NOT NULL DEFAULT 'seeker',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own profile"
      ON public.user_profiles FOR SELECT
      USING (auth.uid() = id);
      
    CREATE POLICY "Users can update own profile"
      ON public.user_profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Step 2: Insert or update your lawyer profile
INSERT INTO public.user_profiles (id, role, created_at, updated_at)
SELECT 
  u.id,
  'lawyer'::user_role,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'alirezaeshghi29101985@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'lawyer'::user_role,
  updated_at = NOW();

-- Step 3: Verify it worked
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as auth_metadata_role,
  up.role as user_profiles_role,
  lp.id IS NOT NULL as has_lawyer_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.lawyer_profiles lp ON u.id = lp.id
WHERE u.email = 'alirezaeshghi29101985@gmail.com';

-- You should see:
-- auth_metadata_role: lawyer
-- user_profiles_role: lawyer  
-- has_lawyer_profile: true
