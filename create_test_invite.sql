-- Helper: Generate Test Invite for Authenticated Renovator
-- This script finds a recent job and invites the renovator (user) to it.

DO $$
DECLARE
    v_renovator_id UUID;
    v_job_id UUID;
    v_target_email TEXT := 'saeid_shabani@outlook.com'; -- HARDCODED for this user
BEGIN
    -- 1. Find the Renovator ID for this user
    SELECT id INTO v_renovator_id
    FROM public.renovation_partners
    WHERE email = v_target_email OR 
          user_id = (SELECT id FROM auth.users WHERE email = v_target_email);

    IF v_renovator_id IS NULL THEN
        RAISE EXCEPTION 'Renovator profile not found for %. Please create profile first.', v_target_email;
    END IF;

    -- 2. Find a recent Emergency Job (that is NOT assigned yet)
    SELECT id INTO v_job_id
    FROM public.emergency_jobs
    WHERE status IN ('DISPATCHED') -- only if dispatched
    ORDER BY created_at DESC
    LIMIT 1;

    -- If no dispatched job, find ANY job just for testing (even if assigned, we can add invite for UI test)
    IF v_job_id IS NULL THEN
         SELECT id INTO v_job_id
        FROM public.emergency_jobs
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    IF v_job_id IS NULL THEN
        RAISE NOTICE 'No jobs found in the system.';
    ELSE
        -- 3. Create/Update Invite
        -- Check if invite exists
        IF EXISTS (SELECT 1 FROM public.emergency_job_invites WHERE job_id = v_job_id AND renovator_id = v_renovator_id) THEN
             -- Update to PENDING just in case
             UPDATE public.emergency_job_invites
             SET status = 'PENDING', expires_at = now() + interval '1 hour'
             WHERE job_id = v_job_id AND renovator_id = v_renovator_id;
             RAISE NOTICE 'Updated existing invite for % to Job %', v_target_email, v_job_id;
        ELSE
            INSERT INTO public.emergency_job_invites (job_id, renovator_id, status, expires_at)
            VALUES (v_job_id, v_renovator_id, 'PENDING', now() + interval '1 hour');
            RAISE NOTICE 'Created NEW invite for % to Job %', v_target_email, v_job_id;
        END IF;

        -- Ensure Job is Dispatched if we are testing invites
        UPDATE public.emergency_jobs 
        SET status = 'DISPATCHED' 
        WHERE id = v_job_id AND status = 'PENDING';
        
    END IF;

END $$;
