-- EMERGENCY FIX SCRIPT (Run this if Acceptance Errors Persist)

DO $$
DECLARE
    v_invite RECORD;
    v_job_id UUID;
BEGIN
    -- 1. Find the most recent pending invite
    SELECT * INTO v_invite
    FROM public.emergency_job_invites
    WHERE status = 'PENDING'
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_invite IS NULL THEN
        RAISE NOTICE 'No pending invite found to fix.';
        RETURN;
    END IF;

    v_job_id := v_invite.job_id;
    RAISE NOTICE 'Found Pending Invite for Job: %', v_job_id;

    -- 2. Force Job Status to DISPATCHED (Correct state for acceptance)
    UPDATE public.emergency_jobs
    SET status = 'DISPATCHED'
    WHERE id = v_job_id AND status != 'DISPATCHED';
    
    RAISE NOTICE 'Forced Job % status to DISPATCHED', v_job_id;

    -- 3. Ensure User is a Renovator (Double Check)
    -- Just logging, can't fix auth user via script easily without knowing exact email
    
END $$;
