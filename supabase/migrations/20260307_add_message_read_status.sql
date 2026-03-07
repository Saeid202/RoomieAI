-- Migration to add read status to messages
-- Add read_at column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create an index to quickly find unread messages for a specific user in a conversation
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON public.messages (conversation_id, sender_id) 
WHERE read_at IS NULL;

-- (Optional) Update existing messages as read
-- UPDATE public.messages SET read_at = created_at WHERE read_at IS NULL;

-- Add a column to conversations for a high-level cache if needed (optional)
-- ALTER TABLE public.conversations ADD COLUMN last_read_at TIMESTAMP WITH TIME ZONE;
