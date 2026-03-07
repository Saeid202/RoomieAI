-- =====================================================
-- Add Lawyer Conversation Support to Main Messenger
-- =====================================================
-- This migration extends the conversations table to support
-- lawyer-client consultations in the unified messenger system

-- Add new columns to conversations table
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS conversation_type TEXT,
  ADD COLUMN IF NOT EXISTS lawyer_profile_id UUID REFERENCES lawyer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS conversation_metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_lawyer_profile 
  ON conversations(lawyer_profile_id) 
  WHERE lawyer_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_type 
  ON conversations(conversation_type) 
  WHERE conversation_type IS NOT NULL;

-- Update RLS policies to include lawyer conversations
-- Drop existing policies that need updating
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Recreate policies with lawyer support
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT
  USING (
    auth.uid() = landlord_id 
    OR auth.uid() = tenant_id
    OR auth.uid() IN (
      SELECT user_id FROM lawyer_profiles 
      WHERE id = conversations.lawyer_profile_id
    )
    OR EXISTS (
      SELECT 1 FROM co_ownership_group_members
      WHERE group_id = conversations.co_ownership_group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = tenant_id 
    OR auth.uid() = landlord_id
    OR auth.uid() IN (
      SELECT user_id FROM lawyer_profiles 
      WHERE id = conversations.lawyer_profile_id
    )
  );

-- Add comment for documentation
COMMENT ON COLUMN conversations.conversation_type IS 
  'Type of conversation: property_rental, property_sale, emergency_job, co_ownership, direct_chat, lawyer_consultation';

COMMENT ON COLUMN conversations.lawyer_profile_id IS 
  'Reference to lawyer profile if this is a lawyer consultation conversation';

COMMENT ON COLUMN conversations.conversation_metadata IS 
  'Flexible JSON storage for conversation context (consultation type, topic, etc.)';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('conversation_type', 'lawyer_profile_id', 'conversation_metadata')
ORDER BY column_name;
