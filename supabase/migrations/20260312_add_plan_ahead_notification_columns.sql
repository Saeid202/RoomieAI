-- Create payment_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns to payment_notifications table for Plan Ahead matches
ALTER TABLE payment_notifications
  ADD COLUMN IF NOT EXISTS property_id UUID,
  ADD COLUMN IF NOT EXISTS property_link TEXT;

-- Create index for property_id
CREATE INDEX IF NOT EXISTS idx_payment_notifications_property_id ON payment_notifications(property_id);
