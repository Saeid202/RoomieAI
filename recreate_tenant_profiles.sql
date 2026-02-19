-- Drop the wrong tenant_profiles table and create the correct one

-- Step 1: Drop the existing table (it has 0 records, so safe to drop)
DROP TABLE IF EXISTS public.tenant_profiles CASCADE;

-- Step 2: Create the correct tenant_profiles table
CREATE TABLE public.tenant_profiles (
    -- Primary key
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Profile Info
    linkedin TEXT,
    about_me TEXT,
    prefer_not_to_say TEXT,
    profile_visibility TEXT DEFAULT 'public',
    
    -- Housing Search
    preferred_location TEXT,
    budget_range TEXT,
    move_in_date_start TEXT,
    move_in_date_end TEXT,
    housing_type TEXT,
    living_space TEXT,
    
    -- Lifestyle
    smoking TEXT,
    lives_with_smokers TEXT,
    has_pets BOOLEAN DEFAULT false,
    pet_type TEXT,
    pet_preference TEXT,
    diet TEXT,
    diet_other TEXT,
    hobbies TEXT[],
    
    -- Work
    work_location TEXT,
    work_location_legacy TEXT,
    work_schedule TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add indexes
CREATE INDEX idx_tenant_profiles_user_id ON public.tenant_profiles(user_id);

-- Step 4: Enable RLS
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Users can view own tenant profile" 
ON public.tenant_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tenant profile" 
ON public.tenant_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenant profile" 
ON public.tenant_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tenant profile" 
ON public.tenant_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_tenant_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_profiles_updated_at
    BEFORE UPDATE ON public.tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_profiles_updated_at();

-- Step 7: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 8: Verify
SELECT 
    'tenant_profiles table recreated successfully' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'tenant_profiles';

-- Step 9: Show all columns
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
ORDER BY ordinal_position;
