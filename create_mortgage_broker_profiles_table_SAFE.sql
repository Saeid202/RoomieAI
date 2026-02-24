-- Safe version: Drop existing policies and recreate everything
-- This handles the case where the table was partially created

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Brokers can view own profile" ON mortgage_broker_profiles;
DROP POLICY IF EXISTS "Brokers can insert own profile" ON mortgage_broker_profiles;
DROP POLICY IF EXISTS "Brokers can update own profile" ON mortgage_broker_profiles;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_mortgage_broker_profiles_updated_at ON mortgage_broker_profiles;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_mortgage_broker_profiles_updated_at();

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS mortgage_broker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  company_name TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE mortgage_broker_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Brokers can view own profile"
  ON mortgage_broker_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Brokers can insert own profile"
  ON mortgage_broker_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brokers can update own profile"
  ON mortgage_broker_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mortgage_broker_profiles_user_id 
  ON mortgage_broker_profiles(user_id);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_mortgage_broker_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_mortgage_broker_profiles_updated_at
  BEFORE UPDATE ON mortgage_broker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_mortgage_broker_profiles_updated_at();

-- Verify the table was created
SELECT 'mortgage_broker_profiles table created successfully!' AS status;
