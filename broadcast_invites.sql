-- Broadcast missing invites to all active renovators
-- This script finds all OPEN/PENDING emergency jobs and creates invites for any renovator
-- who hasn't been invited yet. This retroactively fixes the "I can't see the request" issue.

DO $$ 
DECLARE
    r RECORD;
    p RECORD;
    notify_count INT := 0;
BEGIN 
    -- Loop through all emergency jobs that are in 'DISPATCHED' or 'PENDING' status (or whatever the active status is)
    -- Assuming 'DISPATCHED' is the status for active broadcasts
    FOR r IN SELECT * FROM public.emergency_jobs WHERE status IN ('DISPATCHED', 'PENDING') LOOP
        
        -- Loop through all available renovator profiles
        FOR p IN SELECT id FROM public.renovation_partners LOOP
            
            -- Check if invite already exists
            IF NOT EXISTS (
                SELECT 1 FROM public.emergency_job_invites 
                WHERE job_id = r.id AND renovator_id = p.id
            ) THEN
                -- Create invite
                INSERT INTO public.emergency_job_invites (
                    job_id,
                    renovator_id,
                    status,
                    expires_at,
                    created_at
                ) VALUES (
                    r.id,
                    p.id,
                    'PENDING',
                    NOW() + INTERVAL '24 hours', -- Extend expiry just in case
                    NOW()
                );
                notify_count := notify_count + 1;
            END IF;
            
        END LOOP;
        
    END LOOP;

    RAISE NOTICE 'Broadcasted % new invites to renovators.', notify_count;
END $$;
