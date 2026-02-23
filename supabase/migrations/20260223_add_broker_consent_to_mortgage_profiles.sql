-- Add broker consent columns to mortgage_profiles table
-- This allows seekers to explicitly consent to sharing their profile with mortgage brokers

-- Add consent column (defaults to FALSE for privacy-first approach)
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS broker_consent BOOLEAN DEFAULT FALSE;

-- Add timestamp to track when consent was given
ALTER TABLE mortgage_profiles 
ADD COLUMN IF NOT EXISTS broker_consent_date TIMESTAMP WITH TIME ZONE;

-- Add index for efficient broker queries (only profiles with consent)
CREATE INDEX IF NOT EXISTS idx_mortgage_profiles_broker_consent 
ON mortgage_profiles(broker_consent) 
WHERE broker_consent = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN mortgage_profiles.broker_consent IS 'User consent to share profile with mortgage brokers';
COMMENT ON COLUMN mortgage_profiles.broker_consent_date IS 'Timestamp when consent was given or last updated';

-- Create function to automatically update consent timestamp
CREATE OR REPLACE FUNCTION update_broker_consent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- If consent is being given (changed from FALSE/NULL to TRUE)
  IF NEW.broker_consent = TRUE AND (OLD.broker_consent IS NULL OR OLD.broker_consent = FALSE) THEN
    NEW.broker_consent_date = NOW();
  -- If consent is being revoked (changed from TRUE to FALSE)
  ELSIF NEW.broker_consent = FALSE AND OLD.broker_consent = TRUE THEN
    NEW.broker_consent_date = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp
DROP TRIGGER IF EXISTS trigger_update_broker_consent_timestamp ON mortgage_profiles;
CREATE TRIGGER trigger_update_broker_consent_timestamp
  BEFORE UPDATE ON mortgage_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_consent_timestamp();

-- Update existing profiles to have explicit FALSE consent (privacy-first)
UPDATE mortgage_profiles 
SET broker_consent = FALSE 
WHERE broker_consent IS NULL;
