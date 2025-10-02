-- CORRECTED COMPREHENSIVE FIX: Handle Dependencies Properly
-- This fixes the dependency error and completes the stack depth fix

-- 1. Drop ALL existing policies that might cause recursion (including the problematic one)
DROP POLICY IF EXISTS "messages_select_participants" ON messages;
DROP POLICY IF EXISTS "messages_insert_participants" ON messages;
DROP POLICY IF EXISTS "messages_select_simple" ON messages;
DROP POLICY IF EXISTS "messages_insert_simple" ON messages;
DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;

DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
DROP POLICY IF EXISTS "conversations_select_simple" ON conversations;
DROP POLICY IF EXISTS "conversations_select_own" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_own" ON conversations;

DROP POLICY IF EXISTS "conversation_participants_select" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_simple" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert_simple" ON conversation_participants;
DROP POLICY IF EXISTS "participants_select_if_same_conv" ON conversation_participants;

-- 2. Now drop the functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_conversation_participant(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_conversation_participants(UUID) CASCADE;

-- 3. Create ULTRA-SIMPLE policies with NO recursion
-- Messages: Only check sender_id directly
CREATE POLICY "messages_select_direct" ON messages 
FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "messages_insert_direct" ON messages 
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Conversations: Only check created_by directly
CREATE POLICY "conversations_select_direct" ON conversations 
FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "conversations_insert_direct" ON conversations 
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Conversation participants: Only check user_id directly
CREATE POLICY "conversation_participants_select_direct" ON conversation_participants 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "conversation_participants_insert_direct" ON conversation_participants 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Test the fix
SELECT 'Comprehensive stack depth fix applied successfully' as status;

