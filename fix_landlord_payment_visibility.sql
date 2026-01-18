-- Fix Landlord Payments Visibility
-- Update RLS to allow landlords to see payments addressed to their email

BEGIN;

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Landlords can view property payments" ON rental_payments;

-- Create new policy that identifies landlord by recipient_email or landlord_id
CREATE POLICY "Landlords can view payments via recipient_email" ON rental_payments
FOR SELECT TO authenticated
USING (
    -- Direct association
    auth.uid() = landlord_id
    OR
    -- Email association (normalized)
    LOWER(TRIM(recipient_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
);

COMMIT;
