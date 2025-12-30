-- Create a dummy renovator profile for the current user if they have the renovator role
-- Corrected column names based on React component inspection: company, name, location

DO $$ 
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'saeid.shabani64@gmail.com'; -- Target only this user
BEGIN 
    -- Get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

    IF v_user_id IS NOT NULL THEN
        -- Check if profile exists
        IF NOT EXISTS (SELECT 1 FROM public.renovation_partners WHERE user_id = v_user_id) THEN
            INSERT INTO public.renovation_partners (
                user_id, 
                company,       -- Corrected from company_name
                name,          -- Contact name
                phone, 
                location,      -- Corrected from service_radius_km (which might not exist or be different)
                description,
                specialties,
                verified,      -- Corrected from is_verified
                email          -- Added email
            ) VALUES (
                v_user_id,
                'My Renovation Co.',
                'Saeid Shabani',
                '555-0123',
                'Toronto, ON',
                'General renovations and repairs.',
                ARRAY['General Repair', 'Plumbing'],
                true,
                v_user_email
            );
            RAISE NOTICE 'Created renovator profile for user %', v_user_email;
        ELSE
            RAISE NOTICE 'Renovator profile already exists for user %', v_user_email;
        END IF;
    ELSE
        RAISE NOTICE 'User % not found', v_user_email;
    END IF;

END $$;
