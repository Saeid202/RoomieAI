-- Create lawyer_profiles table
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  law_firm_name TEXT,
  bar_association_number TEXT,
  practice_areas TEXT[],
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  consultation_fee DECIMAL(10,2),
  bio TEXT,
  city TEXT,
  province TEXT,
  is_accepting_clients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Lawyers can view own profile"
  ON lawyer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can update own profile"
  ON lawyer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can insert own profile"
  ON lawyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view lawyer profiles (for directory feature in Phase 3)
CREATE POLICY "Public can view lawyer profiles"
  ON lawyer_profiles FOR SELECT
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_user_id ON lawyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_city ON lawyer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_practice_areas ON lawyer_profiles USING GIN(practice_areas);
