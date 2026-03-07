-- Create ONLY the landlord_availability table

CREATE TABLE IF NOT EXISTS landlord_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_availability_user ON landlord_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_property ON landlord_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON landlord_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_active ON landlord_availability(is_active);

-- Enable RLS
ALTER TABLE landlord_availability ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own availability" ON landlord_availability;
DROP POLICY IF EXISTS "Anyone can view availability for properties" ON landlord_availability;
DROP POLICY IF EXISTS "Users can manage their own availability" ON landlord_availability;

CREATE POLICY "Users can view their own availability"
  ON landlord_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view availability for properties"
  ON landlord_availability FOR SELECT
  USING (property_id IS NOT NULL);

CREATE POLICY "Users can manage their own availability"
  ON landlord_availability FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_viewing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_availability_timestamp ON landlord_availability;
CREATE TRIGGER update_availability_timestamp
  BEFORE UPDATE ON landlord_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_updated_at();

-- Verify
SELECT 'landlord_availability table created successfully!' as status;
