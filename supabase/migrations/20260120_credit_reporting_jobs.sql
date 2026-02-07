-- Migration: Monthly Credit Reporting Job (Dry-Run Support)
-- Stores batches of reporting data without sending to bureaus

-- 1. Create Batches Table
CREATE TABLE IF NOT EXISTS public.credit_reporting_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    record_count INTEGER DEFAULT 0,
    dry_run BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't duplicate processing for the same period (optional, but good for idempotency)
    -- However, for dry-runs we might want multiple runs. Let's stick to unique batch IDs mainly.
    -- Constraint: ONE successful batch per period? Maybe strictly enforced later.
    CONSTRAINT ensure_dry_run_flag CHECK (dry_run = true)
);

-- 2. Create Entries Table
CREATE TABLE IF NOT EXISTS public.credit_reporting_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.credit_reporting_batches(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.users(id),
    lease_id UUID REFERENCES public.lease_contracts(id),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'dry_run_completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.credit_reporting_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_reporting_entries ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Admin Only View)
-- Assuming we have an 'admin' role check function or using service_role for the job
CREATE POLICY "Admins can view batches" ON public.credit_reporting_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view entries" ON public.credit_reporting_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Service role policies (for Edge Functions)
-- Use 'service_role' key to insert

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_reporting_batches_period ON public.credit_reporting_batches(reporting_period);
CREATE INDEX IF NOT EXISTS idx_reporting_entries_batch ON public.credit_reporting_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_reporting_entries_tenant ON public.credit_reporting_entries(tenant_id);

-- 6. Comment
COMMENT ON TABLE public.credit_reporting_batches IS 'Stores monthly reporting job results. Dry run only.';
