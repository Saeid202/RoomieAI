-- Create tenant_profiles table - SIMPLE VERSION
-- Matches EXACTLY what SeekerProfile.tsx sends (no type conversions)

-- Step 1: Create the tenant_profiles table
CREATE TABLE IF NOT EXISTS public.tenant_profiles (
    -- Primary key
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Profile Info
    linkedin TEXT,
    about_me TEXT,
    prefer_not_to_say TEXT,
    profile_visibility TEXT DEFAULT 'public',
    
    -- Housing Search (keep as strings - match frontend)
    preferred_location TEXT, -- Single string, not array
    budget_range TEXT, -- e.g., "$500 - $1500"
    move_in_date_start TEXT, -- String, not date
    move_in_date_end TEXT,
    housing_type TEXT,
    living_space TEXT,
    
    -- Lifestyle
    smoking TEXT, -- "Yes" or "No"
    lives_with_smokers TEXT, -- "yes" or "no"
    has_pets BOOLEAN DEFAULT false,
    pet_type TEXT,
    pet_preference TEXT,
    diet TEXT,
    diet_other TEXT,
    hobbies TEXT[], -- Array (frontend sends array)
    
    -- Work
    work_location TEXT, -- "remote" or "go to office"
    work_location_legacy TEXT,
    work_schedule TEXT, -- "day shift", "evening shift", "night shift"
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add indexes
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user_id ON public.tenant_profiles(user_id);

-- Step 3: Enable RLS
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Users can view own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can view own tenant profile" 
ON public.tenant_profiles FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can insert own tenant profile" 
ON public.tenant_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can update own tenant profile" 
ON public.tenant_profiles FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can delete own tenant profile" 
ON public.tenant_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_tenant_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenant_profiles_updated_at ON public.tenant_profiles;
CREATE TRIGGER update_tenant_profiles_updated_at
    BEFORE UPDATE ON public.tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_profiles_updated_at();

-- Step 6: Add comments
COMMENT ON TABLE public.tenant_profiles IS 'Extended profile data for tenants/seekers';

-- Step 7: Verify
SELECT 
    'tenant_profiles table created successfully' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'tenant_profiles';

-- Step 8: Show the structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
ORDER BY ordinal_position;
