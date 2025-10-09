import { supabase } from '@/integrations/supabase/client';
import { Conversation, Message, ConversationWithMessages } from '@/types/messaging';

export class MessagingService {
  // Get all conversations for the current user
  static async getConversations(): Promise<ConversationWithMessages[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Use direct SQL query - simplified to avoid column issues
      const { data, error } = await supabase
        .from('conversations' as any)
        .select('*')
        .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      console.log('Raw conversations data:', data);
      
      // Get messages for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv: any) => {
          try {
            const { data: messages } = await supabase
              .from('messages' as any)
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true });
            
            return {
              ...conv,
              messages: messages || []
            } as ConversationWithMessages;
          } catch (messageError) {
            console.error('Error fetching messages for conversation:', conv.id, messageError);
            return {
              ...conv,
              messages: []
            } as ConversationWithMessages;
          }
        })
      );

      return conversationsWithMessages;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages' as any)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as Message[];
  }

  // Send a message
  static async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: message, error } = await supabase
      .from('messages' as any)
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last_message_at
    await supabase
      .from('conversations' as any)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return message as unknown as Message;
  }

  // Create or get existing conversation
  static async getOrCreateConversation(
    propertyId: string,
    landlordId: string,
    tenantId: string
  ): Promise<string> {
    // Check if conversation already exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations' as any)
      .select('id')
      .eq('property_id', propertyId)
      .eq('landlord_id', landlordId)
      .eq('tenant_id', tenantId)
      .single();

    if (existingConversation && !fetchError) {
      return (existingConversation as any).id;
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations' as any)
      .insert({
        property_id: propertyId,
        landlord_id: landlordId,
        tenant_id: tenantId
      })
      .select('id')
      .single();

    if (createError) throw createError;
    return (newConversation as any).id;
  }

  // Subscribe to real-time message updates
  static subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to conversation updates
  static subscribeToConversations(callback: () => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        callback
      )
      .subscribe();
  }
}