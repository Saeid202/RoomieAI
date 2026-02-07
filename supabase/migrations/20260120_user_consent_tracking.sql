-- Migration: User Consent Tracking for Credit Reporting
-- Stores auditable tenant opt-in/opt-out for credit reporting

CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- e.g. 'rent_credit_reporting'
    granted BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) NOT NULL, -- 'digital_wallet' | 'autopay_setup'
    ip_address VARCHAR(45), -- Supports IPv4 and IPv6
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own consents" ON public.user_consents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents" ON public.user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System/Admins can view all (if needed, usually via service role)

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON public.user_consents(granted);

-- Comment for internal documentation
COMMENT ON TABLE public.user_consents IS 'Stores auditable tenant consent. Consent collected — no reporting performed yet.';
