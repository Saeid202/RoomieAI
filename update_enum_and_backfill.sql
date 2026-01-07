
-- 1. Ensure the user_type enum has the values we expect
-- We add 'Landlord', 'Renovator', and 'Seeker' to ensure the capitalized versions exist.
-- If they already exist, this might throw a warning or error depending on Postgres version, but 'IF NOT EXISTS' handles it in PG 12+.

DO $$
BEGIN
    ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'Landlord';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Value Landlord already exists';
END $$;

DO $$
BEGIN
    ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'Renovator';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Value Renovator already exists';
END $$;

DO $$
BEGIN
    ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'Seeker';
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Value Seeker already exists';
END $$;

-- 2. Backfill profiles again
DO $$
DECLARE
    user_record record;
    user_role text;
    mapped_role text;
BEGIN
    FOR user_record IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        user_role := COALESCE(user_record.raw_user_meta_data->>'role', 'seeker');
        
        -- Map to Capitalized Enum Values
        IF user_role ILIKE 'landlord' THEN
            mapped_role := 'Landlord';
        ELSIF user_role ILIKE 'renovator' THEN
            mapped_role := 'Renovator';
        ELSE
            mapped_role := 'Seeker';
        END IF;

        BEGIN
            INSERT INTO public.profiles (id, email, full_name, user_type)
            VALUES (
                user_record.id, 
                user_record.email, 
                COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)),
                mapped_role::public.user_type
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to insert profile for % (Role: %). Error: %', user_record.email, mapped_role, SQLERRM;
        END;
    END LOOP;
END $$;
