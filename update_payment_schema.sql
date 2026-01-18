-- Add payment tracking columns to rental_applications
ALTER TABLE rental_applications ADD COLUMN IF NOT EXISTS step_4_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE rental_applications ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';

-- Ensure rental_payments has the required columns for the state machine
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'none';
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Update valid check for payment_status in rental_payments if it already exists
-- (using a DO block to be safe with existing constraints)
DO $$ 
BEGIN
    ALTER TABLE rental_payments DROP CONSTRAINT IF EXISTS rental_payments_payment_status_check;
    ALTER TABLE rental_payments ADD CONSTRAINT rental_payments_payment_status_check 
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'paid', 'awaiting_payment'));
END $$;
