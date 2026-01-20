-- Add optional note column to rental_payments
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS note TEXT;

-- Index for note searching if needed later
CREATE INDEX IF NOT EXISTS idx_rental_payments_note ON rental_payments USING GIN (to_tsvector('english', coalesce(note, '')));
