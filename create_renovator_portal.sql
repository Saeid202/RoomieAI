-- =====================================================
-- RENOVATOR PORTAL BACKEND MIGRATION
-- =====================================================

-- 1. Extend renovation_partners to link with Auth Users
-- This enables a user to "be" a renovator partner
ALTER TABLE public.renovation_partners 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_renovation_partners_user_id ON public.renovation_partners(user_id);

-- RLS: Allow users to read/update their own profile
DROP POLICY IF EXISTS "Renovators can update their own profile" ON public.renovation_partners;
CREATE POLICY "Renovators can update their own profile"
    ON public.renovation_partners FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Renovators can view their own profile" ON public.renovation_partners;
CREATE POLICY "Renovators can view their own profile"
    ON public.renovation_partners FOR SELECT
    USING (auth.uid() = user_id);


-- 2. Renovator Availability Table
CREATE TABLE IF NOT EXISTS public.renovator_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    renovator_id UUID REFERENCES public.renovation_partners(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    emergency_available BOOLEAN DEFAULT false,
    working_hours JSONB DEFAULT '{
        "monday": {"start": "09:00", "end": "17:00", "active": true},
        "tuesday": {"start": "09:00", "end": "17:00", "active": true},
        "wednesday": {"start": "09:00", "end": "17:00", "active": true},
        "thursday": {"start": "09:00", "end": "17:00", "active": true},
        "friday": {"start": "09:00", "end": "17:00", "active": true},
        "saturday": {"start": "10:00", "end": "14:00", "active": false},
        "sunday": {"start": "10:00", "end": "14:00", "active": false}
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.renovator_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Renovators manage their own availability" ON public.renovator_availability;
CREATE POLICY "Renovators manage their own availability"
    ON public.renovator_availability
    USING (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = renovator_availability.renovator_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = renovator_availability.renovator_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Landlords view availability" ON public.renovator_availability;
CREATE POLICY "Landlords view availability"
    ON public.renovator_availability FOR SELECT
    USING (true); -- Public/Landlord read access


-- 3. Renovator Service Area Table
CREATE TABLE IF NOT EXISTS public.renovator_service_area (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    renovator_id UUID REFERENCES public.renovation_partners(id) ON DELETE CASCADE,
    base_city VARCHAR(255),
    radius_km INTEGER DEFAULT 25,
    coverage_cities TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.renovator_service_area ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Renovators manage their own service area" ON public.renovator_service_area;
CREATE POLICY "Renovators manage their own service area"
    ON public.renovator_service_area
    USING (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = renovator_service_area.renovator_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = renovator_service_area.renovator_id AND user_id = auth.uid()));


-- 4. Job Quotes Table
CREATE TABLE IF NOT EXISTS public.job_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.emergency_jobs(id) ON DELETE CASCADE,
    renovator_id UUID REFERENCES public.renovation_partners(id),
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{desc, qty, unit_price, total}]
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'SENT' CHECK (status IN ('SENT', 'ACCEPTED', 'DECLINED', 'REVISED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.job_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Renovators manage their quotes" ON public.job_quotes;
CREATE POLICY "Renovators manage their quotes"
    ON public.job_quotes
    USING (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = job_quotes.renovator_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = job_quotes.renovator_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Landlords view/update quotes for their jobs" ON public.job_quotes;
CREATE POLICY "Landlords view/update quotes for their jobs"
    ON public.job_quotes
    USING (EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_quotes.job_id AND landlord_id = auth.uid()));


-- 5. Job Events Audit Log
CREATE TABLE IF NOT EXISTS public.job_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.emergency_jobs(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- e.g. STATUS_CHANGE, QUOTE_SENT, ACCEPTED
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Viewable by participants" ON public.job_events;
CREATE POLICY "Viewable by participants"
    ON public.job_events FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_events.job_id AND landlord_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.emergency_jobs j
            JOIN public.renovation_partners p ON j.assigned_renovator_id = p.id
            WHERE j.id = job_events.job_id AND p.user_id = auth.uid()
        )
    );

-- 6. Update Emergency Jobs RLS for Renovators
-- Allow assigned renovator to View/Update the job status
DROP POLICY IF EXISTS "Assigned renovator can view job" ON public.emergency_jobs;
CREATE POLICY "Assigned renovator can view job"
    ON public.emergency_jobs FOR SELECT
    USING (
        assigned_renovator_id IS NOT NULL AND 
        EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = emergency_jobs.assigned_renovator_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Assigned renovator can update job" ON public.emergency_jobs;
CREATE POLICY "Assigned renovator can update job"
    ON public.emergency_jobs FOR UPDATE
    USING (
        assigned_renovator_id IS NOT NULL AND 
        EXISTS (SELECT 1 FROM public.renovation_partners WHERE id = emergency_jobs.assigned_renovator_id AND user_id = auth.uid())
    );

-- 7. Update Job Invites RLS
-- Allow renovator to view invites sent to them (based on user_id link)
DROP POLICY IF EXISTS "Renovator can view own invites" ON public.emergency_job_invites;
CREATE POLICY "Renovator can view own invites"
    ON public.emergency_job_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.renovation_partners 
            WHERE id = emergency_job_invites.renovator_id 
            AND user_id = auth.uid()
        )
    );

-- 8. RPC: Accept Job as Authenticated Renovator (Atomic)
CREATE OR REPLACE FUNCTION public.renovator_accept_job(p_invite_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invite RECORD;
    v_job RECORD;
    v_renovator_id UUID;
BEGIN
    -- Get Renovator ID from Auth User
    SELECT id INTO v_renovator_id FROM public.renovation_partners WHERE user_id = auth.uid();
    
    IF v_renovator_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not a registered renovator');
    END IF;

    -- Get Invite
    SELECT * INTO v_invite FROM public.emergency_job_invites WHERE id = p_invite_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invite not found');
    END IF;
    
    IF v_invite.renovator_id != v_renovator_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    IF v_invite.status != 'PENDING' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invite already processed');
    END IF;

    IF v_invite.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invite expired');
    END IF;

    -- Check Job Status
    SELECT * INTO v_job FROM public.emergency_jobs WHERE id = v_invite.job_id;
    
    IF v_job.status != 'DISPATCHED' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Job no longer available');
    END IF;

    -- ATOMIC UPDATE
    -- 1. Update Invite
    UPDATE public.emergency_job_invites 
    SET status = 'ACCEPTED', responded_at = now() 
    WHERE id = v_invite.id;

    -- 2. Expire others
    UPDATE public.emergency_job_invites
    SET status = 'EXPIRED'
    WHERE job_id = v_invite.job_id AND id != v_invite.id AND status = 'PENDING';

    -- 3. Update Job
    UPDATE public.emergency_jobs
    SET status = 'ASSIGNED', 
        assigned_renovator_id = v_renovator_id,
        accepted_at = now()
    WHERE id = v_invite.job_id;

    -- 4. Audit Log
    INSERT INTO public.job_events (job_id, actor_user_id, event_type, payload)
    VALUES (v_invite.job_id, auth.uid(), 'JOB_ACCEPTED', jsonb_build_object('invite_id', v_invite.id));

    RETURN jsonb_build_object('success', true, 'job_id', v_invite.job_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
