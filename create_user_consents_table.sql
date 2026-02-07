-- Create user_consents table for tracking user consent for various features
CREATE TABLE IF NOT EXISTS public.user_consents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type text NOT NULL,
    granted boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    source text DEFAULT 'digital_wallet'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_consents_user_type ON public.user_consents(user_id, consent_type);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own consents
CREATE POLICY "Users can view own consents" ON public.user_consents
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents" ON public.user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents
CREATE POLICY "Users can update own consents" ON public.user_consents
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own consents
CREATE POLICY "Users can delete own consents" ON public.user_consents
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_consents TO authenticated;
GRANT SELECT ON public.user_consents TO anon;
