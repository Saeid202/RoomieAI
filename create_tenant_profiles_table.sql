-- Create tenant_profiles table to separate tenant-specific data from user_profiles
-- This creates a clean architecture matching landlord_verifications and renovation_partners

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
CREATE POLICY "Users can view own tenant profile" 
ON public.tenant_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own tenant profile
CREATE POLICY "Users can insert own tenant profile" 
ON public.tenant_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tenant profile
CREATE POLICY "Users can update own tenant profile" 
ON public.tenant_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own tenant profile
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

CREATE TRIGGER update_tenant_profiles_updated_at
    BEFORE UPDATE ON public.tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_profiles_updated_at();

-- Step 6: Migrate existing data from user_profiles to tenant_profiles
-- Only migrate users with role 'tenant', 'seeker', or containing 'tenant'
DO $$
BEGIN
    -- Check if user_profiles has the columns we're trying to migrate
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'preferred_location'
    ) THEN
        INSERT INTO public.tenant_profiles (
            user_id,
            preferred_locations,
            budget_min,
            budget_max,
            move_in_date_start,
            move_in_date_end,
            housing_type,
            living_space,
            smoking,
            lives_with_smokers,
            has_pets,
            pet_type,
            pet_preference,
            diet,
            diet_other,
            work_location,
            work_location_legacy,
            work_schedule,
            profile_visibility,
            prefer_not_to_say,
            hobbies,
            about_me,
            linkedin,
            created_at,
            updated_at
        )
        SELECT 
            id as user_id,
            -- Convert single location to array
            CASE 
                WHEN preferred_location IS NOT NULL AND preferred_location != '' 
                THEN ARRAY[preferred_location]::TEXT[]
                ELSE NULL
            END as preferred_locations,
            -- Extract budget min/max from budget_range string
            CASE 
                WHEN budget_range IS NOT NULL AND budget_range LIKE '%-%'
                THEN NULLIF(TRIM(split_part(budget_range, '-', 1)), '')::INTEGER
                WHEN budget_range IS NOT NULL AND budget_range ~ '^\d+$'
                THEN budget_range::INTEGER
                ELSE NULL
            END as budget_min,
            CASE 
                WHEN budget_range IS NOT NULL AND budget_range LIKE '%-%'
                THEN NULLIF(TRIM(split_part(budget_range, '-', 2)), '')::INTEGER
                ELSE NULL
            END as budget_max,
            move_in_date_start,
            move_in_date_end,
            housing_type,
            living_space,
            smoking,
            lives_with_smokers,
            has_pets,
            pet_type,
            pet_preference,
            diet,
            diet_other,
            work_location,
            work_location_legacy,
            work_schedule,
            COALESCE(profile_visibility, 'public') as profile_visibility,
            prefer_not_to_say,
            CASE 
                WHEN hobbies IS NOT NULL THEN hobbies
                ELSE NULL
            END as hobbies,
            about_me,
            linkedin,
            created_at,
            updated_at
        FROM public.user_profiles
        WHERE 
            (role = 'tenant' OR role = 'seeker' OR role LIKE '%tenant%' OR role LIKE '%seeker%')
            AND id NOT IN (SELECT user_id FROM public.tenant_profiles) -- Avoid duplicates
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Data migration completed';
    ELSE
        RAISE NOTICE 'Skipping data migration - source columns not found in user_profiles';
    END IF;
END $$;

-- Step 7: Add comments for documentation
COMMENT ON TABLE public.tenant_profiles IS 'Extended profile data for tenants/seekers looking for housing';
COMMENT ON COLUMN public.tenant_profiles.user_id IS 'References user_profiles.id';
COMMENT ON COLUMN public.tenant_profiles.preferred_locations IS 'Array of preferred cities/neighborhoods';
COMMENT ON COLUMN public.tenant_profiles.budget_min IS 'Minimum monthly budget in dollars';
COMMENT ON COLUMN public.tenant_profiles.budget_max IS 'Maximum monthly budget in dollars';
COMMENT ON COLUMN public.tenant_profiles.housing_type IS 'Type of housing: share room, private room, studio, one bed condo, two bed condo, house';
COMMENT ON COLUMN public.tenant_profiles.living_space IS 'Living arrangement: privateRoom, sharedRoom, entirePlace';
COMMENT ON COLUMN public.tenant_profiles.profile_visibility IS 'Who can see this profile: public or private';

-- Step 8: Verify the migration
SELECT 
    'tenant_profiles table created successfully' as status,
    COUNT(*) as migrated_records
FROM public.tenant_profiles;

-- Step 9: Show sample data
SELECT 
    user_id,
    preferred_locations,
    budget_min,
    budget_max,
    housing_type,
    created_at
FROM public.tenant_profiles
LIMIT 5;
