-- Create emergency_jobs table
CREATE TABLE IF NOT EXISTS public.emergency_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL, -- Optional if not linked to specific property record
    unit_address TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Plumbing', 'Electrical', 'HVAC', 'Water Leak', 'Heating Failure', 'Lockout', 'Pest', 'Other')),
    urgency TEXT NOT NULL CHECK (urgency IN ('Immediate', 'Same-day')),
    description TEXT NOT NULL,
    access_notes TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'DISPATCHED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_RESPONSE')),
    dispatched_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    assigned_renovator_id UUID REFERENCES public.renovation_partners(id), -- Assuming renovation_partners table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create emergency_job_attachments table
CREATE TABLE IF NOT EXISTS public.emergency_job_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.emergency_jobs(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create emergency_job_invites table
CREATE TABLE IF NOT EXISTS public.emergency_job_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.emergency_jobs(id) ON DELETE CASCADE NOT NULL,
    renovator_id UUID REFERENCES public.renovation_partners(id) ON DELETE CASCADE NOT NULL,
    token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE, -- Secure token
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Invites


-- Create emergency_job_messages table (simple chat)
CREATE TABLE IF NOT EXISTS public.emergency_job_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.emergency_jobs(id) ON DELETE CASCADE NOT NULL,
    sender_user_id UUID REFERENCES auth.users(id) NOT NULL, -- Could be landlord or renovator user_id
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- RLS Policies

-- Emergency Jobs
ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlords can view their own emergency jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords can view their own emergency jobs"
    ON public.emergency_jobs FOR SELECT
    USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can insert their own emergency jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords can insert their own emergency jobs"
    ON public.emergency_jobs FOR INSERT
    WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlords can update their own emergency jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords can update their own emergency jobs"
    ON public.emergency_jobs FOR UPDATE
    USING (auth.uid() = landlord_id);

-- Attachments
ALTER TABLE public.emergency_job_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlords can view their job attachments" ON public.emergency_job_attachments;
CREATE POLICY "Landlords can view their job attachments"
    ON public.emergency_job_attachments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_id AND landlord_id = auth.uid()));

DROP POLICY IF EXISTS "Landlords can insert attachments" ON public.emergency_job_attachments;
CREATE POLICY "Landlords can insert attachments"
    ON public.emergency_job_attachments FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_id AND landlord_id = auth.uid()));

-- Messages
ALTER TABLE public.emergency_job_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view messages" ON public.emergency_job_messages;
CREATE POLICY "Participants can view messages"
    ON public.emergency_job_messages FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_id AND landlord_id = auth.uid())
        -- OR EXISTS (...) -- Renovator access temporarily disabled until user linking is established
    );

DROP POLICY IF EXISTS "Participants can insert messages" ON public.emergency_job_messages;
CREATE POLICY "Participants can insert messages"
    ON public.emergency_job_messages FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_id AND landlord_id = auth.uid())
        -- OR EXISTS (...) -- Renovator access temporarily disabled until user linking is established
    );

-- RLS for Invites (Added in previous step, ensuring Idempotency)
ALTER TABLE public.emergency_job_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlords can manage invites for their jobs" ON public.emergency_job_invites;
CREATE POLICY "Landlords can manage invites for their jobs"
    ON public.emergency_job_invites
    USING (
        EXISTS (
            SELECT 1 FROM public.emergency_jobs 
            WHERE id = emergency_job_invites.job_id 
            AND landlord_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.emergency_jobs 
            WHERE id = emergency_job_invites.job_id 
            AND landlord_id = auth.uid()
        )
    );


-- RPC Function to Accept Job
CREATE OR REPLACE FUNCTION public.accept_emergency_job(invite_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_job RECORD;
    v_renovator RECORD;
BEGIN
    -- 1. Find the invite
    SELECT * INTO v_invite FROM public.emergency_job_invites WHERE token = invite_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid token');
    END IF;

    -- 2. Check if expired or already responded
    IF v_invite.expires_at < now() THEN
         RETURN jsonb_build_object('success', false, 'message', 'Invite expired');
    END IF;

    IF v_invite.status != 'PENDING' THEN
         RETURN jsonb_build_object('success', false, 'message', 'Invite already responded to');
    END IF;

    -- 3. Find the job
    SELECT * INTO v_job FROM public.emergency_jobs WHERE id = v_invite.job_id;

    IF v_job.status != 'DISPATCHED' THEN
         RETURN jsonb_build_object('success', false, 'message', 'Job is no longer available (already assigned or cancelled)');
    END IF;

    -- 4. Accept Logic
    -- Update Invite
    UPDATE public.emergency_job_invites 
    SET status = 'ACCEPTED', responded_at = now() 
    WHERE id = v_invite.id;

    -- Expire other invites for this job
    UPDATE public.emergency_job_invites
    SET status = 'EXPIRED'
    WHERE job_id = v_invite.job_id AND id != v_invite.id AND status = 'PENDING';

    -- Update Job
    UPDATE public.emergency_jobs
    SET status = 'ASSIGNED', 
        assigned_renovator_id = v_invite.renovator_id,
        accepted_at = now()
    WHERE id = v_invite.job_id;

    RETURN jsonb_build_object('success', true, 'job_id', v_invite.job_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- RPC Function to Get Job Details by Invite Token (Public/Secure)
CREATE OR REPLACE FUNCTION public.get_job_by_invite_token(invite_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_job RECORD;
BEGIN
    SELECT * INTO v_invite FROM public.emergency_job_invites WHERE token = invite_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid token');
    END IF;

    IF v_invite.expires_at < now() THEN
         RETURN jsonb_build_object('success', false, 'message', 'Invite expired');
    END IF;

    IF v_invite.status != 'PENDING' THEN
         RETURN jsonb_build_object('success', false, 'message', 'Invite already used');
    END IF;

    SELECT * INTO v_job FROM public.emergency_jobs WHERE id = v_invite.job_id;

    RETURN jsonb_build_object(
        'success', true, 
        'job', jsonb_build_object(
            'category', v_job.category,
            'urgency', v_job.urgency,
            'unit_address', v_job.unit_address, -- Maybe obscure this? Prompt says "no landlord personal data beyond necessary". Address is necessary for renovator to know where it is? usually yes city/zip.
            'description', v_job.description,
            'created_at', v_job.created_at
        )
    );
END;
$$;
