-- Migration: Reporting Export + Compliance Gate (Step 5)

-- 1. Updates to Batches Table
-- Drop existing constraint if it effectively limits us, though we just had a default.
-- Let's explicitly document valid statuses via a Check constraint for safety/clarity.

ALTER TABLE public.credit_reporting_batches
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS exported_at TIMESTAMP WITH TIME ZONE;

-- Update status check (dropping old one if it existed implicitly or effectively)
-- We will just use logic, but let's add a comment for clarity.
COMMENT ON COLUMN public.credit_reporting_batches.status IS 'Status: processing, dry_run_completed, ready_for_review, approved_for_export, exported, blocked';

-- 2. Compliance Issues Table
CREATE TABLE IF NOT EXISTS public.credit_reporting_batch_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.credit_reporting_batches(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES public.credit_reporting_entries(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL, -- 'missing_consent', 'missing_identity', 'data_integrity'
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Audit Log Table
CREATE TABLE IF NOT EXISTS public.credit_reporting_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.credit_reporting_batches(id) ON DELETE CASCADE,
    actor_admin_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL, -- 'validate', 'approve', 'block', 'export_csv', 'export_json'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS Policies
ALTER TABLE public.credit_reporting_batch_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_reporting_audit_logs ENABLE ROW LEVEL SECURITY;

-- Issues: Admin view only
CREATE POLICY "Admins can view batch issues" ON public.credit_reporting_batch_issues
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Audit Logs: Admin view only + Insert (via functions potentially, but let's allow admin insert for now if doing client-side, 
-- though we prefer server-side. For now, strict RLS for view.)
CREATE POLICY "Admins can view audit logs" ON public.credit_reporting_audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_batch_issues_batch ON public.credit_reporting_batch_issues(batch_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_batch ON public.credit_reporting_audit_logs(batch_id);

-- 6. Helper Function for strictly managed updates (optional, but good for "Approval Gate")
-- We will rely on Edge Functions for the logic to ensure multiple steps (audit + update) happen together.

COMMENT ON TABLE public.credit_reporting_audit_logs IS 'Mandatory audit log for all credit reporting actions.';
