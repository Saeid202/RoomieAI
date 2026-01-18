-- Ensure rental_payments supports manual mode
ALTER TABLE rental_payments ALTER COLUMN application_id DROP NOT NULL;
ALTER TABLE rental_payments ALTER COLUMN property_id DROP NOT NULL;
ALTER TABLE rental_payments ALTER COLUMN landlord_id DROP NOT NULL;

-- Add tracking columns
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS payment_source VARCHAR(30) CHECK (payment_source IN ('application', 'manual'));
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS note TEXT;

-- Update existing records to 'application' mode
UPDATE rental_payments SET payment_source = 'application' WHERE payment_source IS NULL;
