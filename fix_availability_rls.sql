
-- Update RLS policies for landlord_availability to allow seekers to see global slots
DROP POLICY IF EXISTS "Anyone can view availability for properties" ON landlord_availability;

CREATE POLICY "Anyone can view availability"
  ON landlord_availability FOR SELECT
  USING (true);
