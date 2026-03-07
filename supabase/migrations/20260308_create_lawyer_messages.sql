-- Create lawyer_messages table for direct messaging between clients and lawyers
CREATE TABLE IF NOT EXISTS lawyer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_profile_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_sender ON lawyer_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_recipient ON lawyer_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_lawyer_profile ON lawyer_messages(lawyer_profile_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_created_at ON lawyer_messages(created_at DESC);

-- Enable RLS
ALTER TABLE lawyer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own messages"
  ON lawyer_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON lawyer_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON lawyer_messages FOR UPDATE
  USING (auth.uid() = recipient_id);
