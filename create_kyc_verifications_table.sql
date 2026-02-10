-- Create KYC Verifications Table
-- This table stores identity verification records for users

CREATE TABLE IF NOT EXISTS public.kyc_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'shufti', 'mock', etc.
    reference_id TEXT NOT NULL UNIQUE, -- Provider's reference ID
    status TEXT NOT NULL DEFAULT 'not_verified', -- 'not_verified', 'pending', 'verified', 'rejected', 'failed', 'expired', 'cancelled'
    
    -- Verification data from provider
    verification_data JSONB, -- Stores provider-specific data
    
    -- Metadata
    rejection_reason TEXT, -- Reason for rejection if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT kyc_status_check CHECK (status IN ('not_verified', 'pending', 'verified', 'rejected', 'failed', 'expired', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_reference_id ON public.kyc_verifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_provider ON public.kyc_verifications(provider);

-- Add verification_status column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN verification_status TEXT DEFAULT 'not_verified';
        ALTER TABLE public.profiles ADD CONSTRAINT verification_status_check 
            CHECK (verification_status IN ('not_verified', 'pending', 'verified', 'rejected', 'failed', 'expired', 'cancelled'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_completed_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN verification_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own KYC records
CREATE POLICY "Users can view own KYC records" ON public.kyc_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own KYC records
CREATE POLICY "Users can insert own KYC records" ON public.kyc_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can update all KYC records (for webhooks)
CREATE POLICY "Service role can update KYC records" ON public.kyc_verifications
    FOR UPDATE USING (auth.role() = 'service_role');

-- Users can update their own KYC records (limited fields)
CREATE POLICY "Users can update own KYC records limited" ON public.kyc_verifications
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        (old.status = 'not_verified' OR old.status = 'rejected' OR old.status = 'failed' OR old.status = 'expired')
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kyc_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_kyc_verifications_updated_at
    BEFORE UPDATE ON public.kyc_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_kyc_verifications_updated_at();

-- Grant permissions
GRANT ALL ON public.kyc_verifications TO authenticated;
GRANT ALL ON public.kyc_verifications TO service_role;
