
-- Consolidate and Fix Renovator & Emergency Permissions
-- Run this in Supabase SQL Editor

-- 1. Ensure Table Structure for renovation_partners
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'renovation_partners' AND column_name = 'user_id') THEN
        ALTER TABLE public.renovation_partners ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Create Unique Index on user_id to prevent duplicate profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_renovator_user ON public.renovation_partners(user_id);

-- 3. Fix self_register_renovator RPC (Correct Column Names)
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
    v_user_email TEXT;
    v_full_name TEXT;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Get user info
    SELECT email, raw_user_meta_data->>'full_name' INTO v_user_email, v_full_name 
    FROM auth.users WHERE id = v_user_id;

    -- Check if already exists
    SELECT id INTO v_partner_id FROM public.renovation_partners WHERE user_id = v_user_id;
    
    IF v_partner_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'id', v_partner_id, 'message', 'Already registered');
    END IF;

    -- Create new profile with CORRECT column names
    INSERT INTO public.renovation_partners (
        user_id, 
        name,
        company, 
        phone, 
        email, 
        specialties,
        location,
        verified,
        is_active
    )
    VALUES (
        v_user_id,
        COALESCE(v_full_name, 'New Renovator'),
        p_company_name,
        p_phone,
        v_user_email,
        ARRAY['General Repairs', 'Plumbing', 'Electrical'],
        'Not Specified',
        true, -- Auto-verify for demo convenience
        true
    )
    RETURNING id INTO v_partner_id;

    -- Create default availability (Online by default for testing)
    INSERT INTO public.renovator_availability (renovator_id, is_online, emergency_available)
    VALUES (v_partner_id, true, true)
    ON CONFLICT (renovator_id) DO UPDATE SET is_online = true, emergency_available = true;

    RETURN jsonb_build_object('success', true, 'id', v_partner_id, 'message', 'Profile created');
END;
$$;

-- 4. Enable RLS on everything
ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_job_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovation_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovator_availability ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function for RLS
CREATE OR REPLACE FUNCTION public.fn_is_renovator_invited(target_job_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM emergency_job_invites i
    JOIN renovation_partners p ON i.renovator_id = p.id
    WHERE i.job_id = target_job_id 
    AND p.user_id = auth.uid()
    AND i.status IN ('PENDING', 'ACCEPTED')
  );
$$;

-- 6. Emergency Jobs Policies
DROP POLICY IF EXISTS "Landlords can manage their jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords can manage their jobs" ON public.emergency_jobs
    FOR ALL USING (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Invited renovator view job" ON public.emergency_jobs;
CREATE POLICY "Invited renovator view job" ON public.emergency_jobs
    FOR SELECT USING (fn_is_renovator_invited(id));

-- 7. Emergency Invites Policies
DROP POLICY IF EXISTS "Landlords can manage invites" ON public.emergency_job_invites;
CREATE POLICY "Landlords can manage invites" ON public.emergency_job_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.emergency_jobs 
            WHERE id = emergency_job_invites.job_id 
            AND landlord_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Renovators view own invites" ON public.emergency_job_invites;
CREATE POLICY "Renovators view own invites" ON public.emergency_job_invites
    FOR SELECT USING (
        renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
    );

-- 8. Renovation Partners Policies
DROP POLICY IF EXISTS "Public view renovation partners" ON public.renovation_partners;
CREATE POLICY "Public view renovation partners" ON public.renovation_partners
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage own profile" ON public.renovation_partners;
CREATE POLICY "Owners manage own profile" ON public.renovation_partners
    FOR ALL USING (user_id = auth.uid());

-- 9. Availability Policies
DROP POLICY IF EXISTS "Owners manage availability" ON public.renovator_availability;
CREATE POLICY "Owners manage availability" ON public.renovator_availability
    FOR ALL USING (
        renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Public view availability" ON public.renovator_availability;
CREATE POLICY "Public view availability" ON public.renovator_availability
    FOR SELECT USING (true);
