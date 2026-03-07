-- Property Viewing Appointments System
-- Allows tenants/buyers to schedule property viewings with availability slots and custom requests

-- Create landlord availability table
CREATE TABLE IF NOT EXISTS landlord_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE, -- NULL means applies to all properties
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
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
  is_custom_request BOOLEAN DEFAULT false, -- true if tenant requested custom time
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'declined')),
  landlord_notes TEXT, -- Notes from landlord when approving/declining
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_availability_user ON landlord_availability(user_id);
CREATE INDEX idx_availability_property ON landlord_availability(property_id);
CREATE INDEX idx_availability_day ON landlord_availability(day_of_week);
CREATE INDEX idx_availability_active ON landlord_availability(is_active);

CREATE INDEX idx_viewing_appointments_property ON property_viewing_appointments(property_id);
CREATE INDEX idx_viewing_appointments_requester ON property_viewing_appointments(requester_id);
CREATE INDEX idx_viewing_appointments_status ON property_viewing_appointments(status);
CREATE INDEX idx_viewing_appointments_date ON property_viewing_appointments(appointment_date);
CREATE INDEX idx_viewing_appointments_custom ON property_viewing_appointments(is_custom_request);

-- Enable RLS
ALTER TABLE landlord_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewing_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for landlord_availability
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

-- RLS Policies for property_viewing_appointments
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

-- Triggers
CREATE TRIGGER update_availability_timestamp
  BEFORE UPDATE ON landlord_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_updated_at();

CREATE TRIGGER update_appointment_timestamp
  BEFORE UPDATE ON property_viewing_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_viewing_updated_at();
