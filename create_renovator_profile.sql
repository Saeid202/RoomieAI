-- Create a dummy renovator profile for the current user if they have the renovator role
-- This is to bypass the "No renovator profile found" error in the Renovator Dashboard

DO $$ 
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'saeid.shabani64@gmail.com'; -- Target only this user initially or fetch current
BEGIN 
    -- Get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

    IF v_user_id IS NOT NULL THEN
        -- Check if user role is renovator or add it if missing
        -- Assuming user_roles table or similar, but for now we focus on the renovators table existence
        -- If the app logic checks 'renovation_partners' table:

        IF NOT EXISTS (SELECT 1 FROM public.renovation_partners WHERE user_id = v_user_id) THEN
            INSERT INTO public.renovation_partners (
                user_id, 
                company_name, 
                phone, 
                service_radius_km, 
                is_verified, 
                status,
                rating,
                completed_jobs
            ) VALUES (
                v_user_id,
                'My Renovation Co.',
                '555-0123',
                50,
                true,
                'active',
                5.0,
                0
            );
            RAISE NOTICE 'Created renovator profile for user %', v_user_email;
        ELSE
            RAISE NOTICE 'Renovator profile already exists for user %', v_user_email;
        END IF;
    ELSE
        RAISE NOTICE 'User % not found', v_user_email;
    END IF;

END $$;
