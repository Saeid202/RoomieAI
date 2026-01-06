-- ROBUST PROPERTY RECOVERY SCRIPT
-- This version handles the mandatory 'user_type' column found in your schema.

DO $$ 
DECLARE 
    current_user_id UUID;
BEGIN
    -- 1. Find your ID
    SELECT id INTO current_user_id FROM auth.users WHERE email = 'saeid.shabani64@gmail.com' LIMIT 1;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'User saeid.shabani64@gmail.com not found in auth.users. Please log in first.';
        RETURN;
    END IF;

    -- 2. Sync 'profiles' table (Handling the mandatory 'user_type' column)
    -- We use a dynamic approach to check if columns exist before inserting
    BEGIN
        INSERT INTO public.profiles (id, email, full_name, user_type)
        VALUES (current_user_id, 'saeid.shabani64@gmail.com', 'Saeid Shabani', 'landlord')
        ON CONFLICT (id) DO UPDATE SET full_name = 'Saeid Shabani';
    EXCEPTION WHEN OTHERS THEN
        -- If user_type fails, try without it or with 'role'
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (current_user_id, 'saeid.shabani64@gmail.com', 'Saeid Shabani')
        ON CONFLICT (id) DO NOTHING;
    END;

    -- 3. Sync 'user_profiles' table (Messaging)
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (current_user_id, 'saeid.shabani64@gmail.com', 'Saeid Shabani')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Assign Landlord Role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (current_user_id, 'landlord', 'SYSTEM')
    ON CONFLICT DO NOTHING;

    -- 5. Claim all properties in the database
    -- We disable RLS temporarily to ensure we can move them
    ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
    UPDATE public.properties SET user_id = current_user_id;
    
    ALTER TABLE public.sales_listings DISABLE ROW LEVEL SECURITY;
    UPDATE public.sales_listings SET user_id = current_user_id;

    RAISE NOTICE 'Success! Properties moved to user ID: %', current_user_id;
END $$;

-- 6. RESET SECURITY POLICIES
DROP POLICY IF EXISTS "Owner manage all" ON public.properties;
CREATE POLICY "Owner manage all" ON public.properties FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manage sales" ON public.sales_listings;
CREATE POLICY "Owner manage sales" ON public.sales_listings FOR ALL USING (auth.uid() = user_id);
ALTER TABLE public.sales_listings ENABLE ROW LEVEL SECURITY;

-- 7. VERIFY
SELECT id, listing_title, user_id FROM public.properties;
