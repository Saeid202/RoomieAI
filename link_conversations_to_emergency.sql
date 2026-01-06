
-- Update Conversations table to support Emergency Jobs
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS emergency_job_id UUID REFERENCES public.emergency_jobs(id);

-- Add helper to get job details for conversations
CREATE OR REPLACE VIEW public.view_emergency_job_conversations AS
SELECT 
    c.*,
    j.category,
    j.description as job_description,
    j.unit_address,
    j.status as job_status
FROM public.conversations c
JOIN public.emergency_jobs j ON c.emergency_job_id = j.id;
