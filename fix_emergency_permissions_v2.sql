
-- COMPREHENSIVE FIX FOR LANDLORD & RENOVATOR PERMISSIONS
-- Run this script to fix "Missing Requests" and "Permission Denied" errors.

-- 1. Enable RLS on valid tables
ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_job_invites ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR EMERGENCY JOBS
-----------------------------------

-- A. Landlords can View/Create/Edit THEIR OWN jobs
DROP POLICY IF EXISTS "Landlords view own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords view own jobs" ON public.emergency_jobs
FOR SELECT USING (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Landlords create own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords create own jobs" ON public.emergency_jobs
FOR INSERT WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS "Landlords update own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords update own jobs" ON public.emergency_jobs
FOR UPDATE USING (landlord_id = auth.uid());

-- B. Renovators can View jobs they are ASSIGNED to
DROP POLICY IF EXISTS "Assigned renovator view job" ON public.emergency_jobs;
CREATE POLICY "Assigned renovator view job" ON public.emergency_jobs
FOR SELECT USING (
    assigned_renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
);

-- C. Renovators can View jobs they are INVITED to (Pending or Accepted)
-- This allows them to see details before accepting
DROP POLICY IF EXISTS "Invited renovator view job" ON public.emergency_jobs;
CREATE POLICY "Invited renovator view job" ON public.emergency_jobs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.emergency_job_invites i
        JOIN public.renovation_partners p ON i.renovator_id = p.id
        WHERE i.job_id = emergency_jobs.id 
        AND p.user_id = auth.uid()
        AND i.status IN ('PENDING', 'ACCEPTED')
    )
);


-- 3. POLICIES FOR JOB INVITES
------------------------------

-- A. Landlords can view/manage invites for their jobs
DROP POLICY IF EXISTS "Landlords manage invites" ON public.emergency_job_invites;
CREATE POLICY "Landlords manage invites" ON public.emergency_job_invites
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.emergency_jobs WHERE id = job_id AND landlord_id = auth.uid())
);

-- B. Renovators can view invites sent to them
DROP POLICY IF EXISTS "Renovators view own invites" ON public.emergency_job_invites;
CREATE POLICY "Renovators view own invites" ON public.emergency_job_invites
FOR SELECT USING (
    renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
);

-- C. Renovators can update (Accept/Decline) invites sent to them
DROP POLICY IF EXISTS "Renovators update own invites" ON public.emergency_job_invites;
CREATE POLICY "Renovators update own invites" ON public.emergency_job_invites
FOR UPDATE USING (
    renovator_id IN (SELECT id FROM public.renovation_partners WHERE user_id = auth.uid())
);

-- 4. GRANT BASIC PERMISSIONS (Just in case)
GRANT ALL ON public.emergency_jobs TO authenticated;
GRANT ALL ON public.emergency_job_invites TO authenticated;

