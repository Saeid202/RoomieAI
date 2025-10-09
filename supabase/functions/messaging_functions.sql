-- Create messaging functions for the messaging service

-- Function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
    id UUID,
    property_id UUID,
    landlord_id UUID,
    tenant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    property_title TEXT,
    landlord_name TEXT,
    tenant_name TEXT,
    last_message_content TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.property_id,
        c.landlord_id,
        c.tenant_id,
        c.created_at,
        c.last_message_at,
        COALESCE(p.listing_title, 'Unknown Property') as property_title,
        COALESCE(l.email, 'Unknown Landlord') as landlord_name,
        COALESCE(t.email, 'Unknown Tenant') as tenant_name,
        c.last_message_content
    FROM conversations c
    LEFT JOIN properties p ON c.property_id = p.id
    LEFT JOIN auth.users l ON c.landlord_id = l.id
    LEFT JOIN auth.users t ON c.tenant_id = t.id
    WHERE c.landlord_id = user_id OR c.tenant_id = user_id
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation messages
CREATE OR REPLACE FUNCTION get_conversation_messages(conversation_id UUID)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at
    FROM messages m
    WHERE m.conversation_id = conversation_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION send_message(
    conversation_id UUID,
    sender_id UUID,
    content TEXT
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    message_id UUID;
BEGIN
    -- Insert the message
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (conversation_id, sender_id, content)
    RETURNING id INTO message_id;
    
    -- Update conversation's last_message_at
    UPDATE conversations 
    SET 
        last_message_at = NOW(),
        last_message_content = content
    WHERE id = conversation_id;
    
    -- Return the inserted message
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at
    FROM messages m
    WHERE m.id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    property_id UUID,
    landlord_id UUID,
    tenant_id UUID
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT id INTO conversation_id
    FROM conversations
    WHERE property_id = get_or_create_conversation.property_id
      AND landlord_id = get_or_create_conversation.landlord_id
      AND tenant_id = get_or_create_conversation.tenant_id
    LIMIT 1;
    
    -- If conversation doesn't exist, create it
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (property_id, landlord_id, tenant_id)
        VALUES (get_or_create_conversation.property_id, 
                get_or_create_conversation.landlord_id, 
                get_or_create_conversation.tenant_id)
        RETURNING id INTO conversation_id;
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
