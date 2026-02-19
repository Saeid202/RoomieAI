-- Create tenant_profiles table WITHOUT data migration
-- Use this if you want to create the table first and migrate data later

-- Step 1: Create the tenant_profiles table
CREATE TABLE IF NOT EXISTS public.tenant_profiles (
    -- Primary key
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Housing Search Preferences
    preferred_locations TEXT[], -- Array of cities/neighborhoods
    budget_min INTEGER,
    budget_max INTEGER,
    move_in_date_start DATE,
    move_in_date_end DATE,
    housing_type TEXT, -- 'share room', 'private room', 'studio', 'one bed condo', 'two bed condo', 'house'
    living_space TEXT, -- 'privateRoom', 'sharedRoom', 'entirePlace'
    
    -- Lifestyle Preferences
    smoking TEXT, -- 'Yes', 'No'
    lives_with_smokers TEXT, -- 'yes', 'no'
    has_pets BOOLEAN DEFAULT false,
    pet_type TEXT,
    pet_preference TEXT,
    diet TEXT, -- 'vegetarian', 'halal', 'kosher', 'noPreference', 'other'
    diet_other TEXT,
    
    -- Work & Schedule
    work_location TEXT, -- 'remote', 'go to office'
    work_location_legacy TEXT,
    work_schedule TEXT, -- 'day shift', 'evening shift', 'night shift'
    
    -- Profile Settings
    profile_visibility TEXT DEFAULT 'public', -- 'public', 'private'
    prefer_not_to_say TEXT,
    
    -- Additional Info
    hobbies TEXT[],
    about_me TEXT,
    linkedin TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user_id ON public.tenant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_locations ON public.tenant_profiles USING GIN (preferred_locations);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_budget ON public.tenant_profiles(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_move_in_date ON public.tenant_profiles(move_in_date_start);

-- Step 3: Enable RLS (Row Level Security)
ALTER TABLE public.tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy: Users can view their own tenant profile
DROP POLICY IF EXISTS "Users can view own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can view own tenant profile" 
ON public.tenant_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own tenant profile
DROP POLICY IF EXISTS "Users can insert own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can insert own tenant profile" 
ON public.tenant_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tenant profile
DROP POLICY IF EXISTS "Users can update own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can update own tenant profile" 
ON public.tenant_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own tenant profile
DROP POLICY IF EXISTS "Users can delete own tenant profile" ON public.tenant_profiles;
CREATE POLICY "Users can delete own tenant profile" 
ON public.tenant_profiles 
FOR DELETE 
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

-- Step 6: Add comments for documentation
COMMENT ON TABLE public.tenant_profiles IS 'Extended profile data for tenants/seekers looking for housing';
COMMENT ON COLUMN public.tenant_profiles.user_id IS 'References user_profiles.id';
COMMENT ON COLUMN public.tenant_profiles.preferred_locations IS 'Array of preferred cities/neighborhoods';
COMMENT ON COLUMN public.tenant_profiles.budget_min IS 'Minimum monthly budget in dollars';
COMMENT ON COLUMN public.tenant_profiles.budget_max IS 'Maximum monthly budget in dollars';
COMMENT ON COLUMN public.tenant_profiles.housing_type IS 'Type of housing: share room, private room, studio, one bed condo, two bed condo, house';
COMMENT ON COLUMN public.tenant_profiles.living_space IS 'Living arrangement: privateRoom, sharedRoom, entirePlace';
COMMENT ON COLUMN public.tenant_profiles.profile_visibility IS 'Who can see this profile: public or private';

-- Step 7: Verify the table was created
SELECT 
    'tenant_profiles table created successfully' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'tenant_profiles';
