-- =====================================================
-- ADD SUBMISSION FIELDS TO MORTGAGE_PROFILES
-- =====================================================
-- Adds fields to track mortgage package submission
-- =====================================================

-- 1. Add submission_channel column
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS submission_channel TEXT CHECK (submission_channel IN ('homie', 'newton', 'both'));

-- 2. Add submission_consent_date column
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS submission_consent_date TIMESTAMPTZ;

-- 3. Add submission_consent_ip column
ALTER TABLE public.mortgage_profiles 
ADD COLUMN IF NOT EXISTS submission_consent_ip TEXT;

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_submission_channel 
    ON public.mortgage_profiles(submission_channel);

CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_submission_consent_date 
    ON public.mortgage_profiles(submission_consent_date);

-- 5. Add comments for documentation
COMMENT ON COLUMN public.mortgage_profiles.submission_channel IS 
    'Where the package is submitted: homie (HomieAI only), newton (Newton Velocity), both (recommended)';

COMMENT ON COLUMN public.mortgage_profiles.submission_consent_date IS 
    'When user gave consent to submit their package';

COMMENT ON COLUMN public.mortgage_profiles.submission_consent_ip IS 
    'IP address of user when they submitted consent';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
