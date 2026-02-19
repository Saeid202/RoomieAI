-- Add missing columns to tenant_profiles table

DO $$ 
BEGIN
    -- Add about_me if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'about_me') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN about_me TEXT;
        RAISE NOTICE 'Added about_me column';
    END IF;

    -- Add linkedin if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'linkedin') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN linkedin TEXT;
        RAISE NOTICE 'Added linkedin column';
    END IF;

    -- Add prefer_not_to_say if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'prefer_not_to_say') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN prefer_not_to_say TEXT;
        RAISE NOTICE 'Added prefer_not_to_say column';
    END IF;

    -- Add profile_visibility if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'profile_visibility') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN profile_visibility TEXT DEFAULT 'public';
        RAISE NOTICE 'Added profile_visibility column';
    END IF;

    -- Add preferred_location if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'preferred_location') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN preferred_location TEXT;
        RAISE NOTICE 'Added preferred_location column';
    END IF;

    -- Add budget_range if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'budget_range') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN budget_range TEXT;
        RAISE NOTICE 'Added budget_range column';
    END IF;

    -- Add move_in_date_start if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'move_in_date_start') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN move_in_date_start TEXT;
        RAISE NOTICE 'Added move_in_date_start column';
    END IF;

    -- Add move_in_date_end if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'move_in_date_end') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN move_in_date_end TEXT;
        RAISE NOTICE 'Added move_in_date_end column';
    END IF;

    -- Add housing_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'housing_type') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN housing_type TEXT;
        RAISE NOTICE 'Added housing_type column';
    END IF;

    -- Add living_space if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'living_space') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN living_space TEXT;
        RAISE NOTICE 'Added living_space column';
    END IF;

    -- Add work_location if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'work_location') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN work_location TEXT;
        RAISE NOTICE 'Added work_location column';
    END IF;

    -- Add work_location_legacy if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'work_location_legacy') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN work_location_legacy TEXT;
        RAISE NOTICE 'Added work_location_legacy column';
    END IF;

    -- Add work_schedule if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'work_schedule') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN work_schedule TEXT;
        RAISE NOTICE 'Added work_schedule column';
    END IF;

    -- Add pet_preference if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'pet_preference') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN pet_preference TEXT;
        RAISE NOTICE 'Added pet_preference column';
    END IF;

    -- Add has_pets if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'has_pets') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN has_pets BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added has_pets column';
    END IF;

    -- Add pet_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'pet_type') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN pet_type TEXT;
        RAISE NOTICE 'Added pet_type column';
    END IF;

    -- Add smoking if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'smoking') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN smoking TEXT;
        RAISE NOTICE 'Added smoking column';
    END IF;

    -- Add lives_with_smokers if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'lives_with_smokers') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN lives_with_smokers TEXT;
        RAISE NOTICE 'Added lives_with_smokers column';
    END IF;

    -- Add diet if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'diet') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN diet TEXT;
        RAISE NOTICE 'Added diet column';
    END IF;

    -- Add diet_other if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'diet_other') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN diet_other TEXT;
        RAISE NOTICE 'Added diet_other column';
    END IF;

    -- Add hobbies if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenant_profiles' AND column_name = 'hobbies') THEN
        ALTER TABLE public.tenant_profiles ADD COLUMN hobbies TEXT[];
        RAISE NOTICE 'Added hobbies column';
    END IF;

END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Show all columns now
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'tenant_profiles'
ORDER BY ordinal_position;
