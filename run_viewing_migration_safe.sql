-- Safe migration for Property Viewing Appointments System
-- This version checks for existing objects before creating them

-- Create landlord availability table
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

-- Create viewing appointments table
CREATE TABLE IF NOT EXISTS property_viewing_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  number_of_attendees INTEGER DEFAULT 1 CHECK (number_of_attendees > 0),
  additional_message TEXT,
  is_custom_request BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'declined')),
  landlord_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create indexes (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_availability_user') THEN
    CREATE INDEX idx_availability_user ON landlord_availability(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_availability_property') THEN
    CREATE INDEX idx_availability_property ON landlord_availability(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_availability_day') THEN
    CREATE INDEX idx_availability_day ON landlord_availability(day_of_week);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_availability_active') THEN
    CREATE INDEX idx_availability_active ON landlord_availability(is_active);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viewing_appointments_property') THEN
    CREATE INDEX idx_viewing_appointments_property ON property_viewing_appointments(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viewing_appointments_requester') THEN
    CREATE INDEX idx_viewing_appointments_requester ON property_viewing_appointments(requester_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viewing_appointments_status') THEN
    CREATE INDEX idx_viewing_appointments_status ON property_viewing_appointments(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viewing_appointments_date') THEN
    CREATE INDEX idx_viewing_appointments_date ON property_viewing_appointments(appointment_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viewing_appointments_custom') THEN
    CREATE INDEX idx_viewing_appointments_custom ON property_viewing_appointments(is_custom_request);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE landlord_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewing_appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own availability" ON landlord_availability;
DROP POLICY IF EXISTS "Anyone can view availability for properties" ON landlord_availability;
DROP POLICY IF EXISTS "Users can manage their own availability" ON landlord_availability;

DROP POLICY IF EXISTS "Users can view their own viewing appointments" ON property_viewing_appointments;
DROP POLICY IF EXISTS "Property owners can view appointments for their properties" ON property_viewing_appointments;
DROP POLICY IF EXISTS "Authenticated users can create viewing appointments" ON property_viewing_appointments;
DROP POLICY IF EXISTS "Property owners can update appointments" ON property_viewing_appointments;
DROP POLICY IF EXISTS "Users can cancel their own appointments" ON property_viewing_appointments;

-- Create RLS Policies for landlord_availability
CREATE POLICY "Users can view their own availability"
  ON landlord_availability
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view availability for properties"
  ON landlord_availability
  FOR SELECT
  USING (property_id IS NOT NULL);

CREATE POLICY "Users can manage their own availability"
  ON landlord_availability
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS Policies for property_viewing_appointments
CREATE POLICY "Users can view their own viewing appointments"
  ON property_viewing_appointments
  FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Property owners can view appointments for their properties"
  ON property_viewing_appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_viewing_appointments.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create viewing appointments"
  ON property_viewing_appointments
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Property owners can update appointments"
  ON property_viewing_appointments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_viewing_appointments.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can cancel their own appointments"
  ON property_viewing_appointments
  FOR UPDATE
  USING (auth.uid() = requester_id)
  WITH CHECK (status = 'cancelled');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_viewing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_availability_timestamp ON landlord_availability;
DROP TRIGGER IF EXISTS update_appointment_timestamp ON property_viewing_appointments;

-- Create triggers
CREATE TRIGGER update_availability_timestamp
  BEFORE UPDATE ON landlord_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_updated_at();

CREATE TRIGGER update_appointment_timestamp
  BEFORE UPDATE ON property_viewing_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_updated_at();

-- Verify tables were created
SELECT 'landlord_availability table created' as status
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'landlord_availability');

SELECT 'property_viewing_appointments table created' as status
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_viewing_appointments');
