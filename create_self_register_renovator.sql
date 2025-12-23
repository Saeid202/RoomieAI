
-- FIX: Link User to Renovator Profile (Self-Healing)

-- 1. Create a helper function to auto-register a renovator profile for the current user if missing
CREATE OR REPLACE FUNCTION public.self_register_renovator(
    p_company_name TEXT DEFAULT 'My Renovation Company',
    p_phone TEXT DEFAULT '555-0100'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_partner_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Check if already exists
    SELECT id INTO v_partner_id FROM public.renovation_partners WHERE user_id = v_user_id;
    
    IF v_partner_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'id', v_partner_id, 'message', 'Already registered');
    END IF;

    -- Create new profile
    INSERT INTO public.renovation_partners (
        user_id, 
        company_name, 
        phone, 
        contact_email, 
        service_types,
        verified
    )
    VALUES (
        v_user_id,
        p_company_name,
        p_phone,
        (SELECT email FROM auth.users WHERE id = v_user_id),
        ARRAY['General Repairs', 'Plumbing', 'Electrical'],
        true -- Auto-verify for beta testing/demo convenience
    )
    RETURNING id INTO v_partner_id;

    -- Create default availability
    INSERT INTO public.renovator_availability (renovator_id, is_online, emergency_available)
    VALUES (v_partner_id, true, true);

    RETURN jsonb_build_object('success', true, 'id', v_partner_id, 'message', 'Profile created');
END;
$$;
