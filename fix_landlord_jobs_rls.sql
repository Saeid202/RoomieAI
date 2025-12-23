
-- Ensure Landlords can manage their own Emergency Jobs

-- 1. Enable RLS (Safe to run if alreay enabled)
ALTER TABLE public.emergency_jobs ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Landlord View Own Jobs
DROP POLICY IF EXISTS "Landlords view own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords view own jobs"
ON public.emergency_jobs
FOR SELECT
USING (landlord_id = auth.uid());

-- 3. Policy: Landlord Create Own Jobs
DROP POLICY IF EXISTS "Landlords create own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords create own jobs"
ON public.emergency_jobs
FOR INSERT
WITH CHECK (landlord_id = auth.uid());

-- 4. Policy: Landlord Update Own Jobs (e.g. Cancel)
DROP POLICY IF EXISTS "Landlords update own jobs" ON public.emergency_jobs;
CREATE POLICY "Landlords update own jobs"
ON public.emergency_jobs
FOR UPDATE
USING (landlord_id = auth.uid());
