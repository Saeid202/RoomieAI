import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export type ConversationType = 'direct' | 'application' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  context_type: string | null;
  context_id: string | null;
  title: string | null;
  created_by: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string | null;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
  is_archived: boolean;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  metadata: any;
  reply_to_id: string | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface Attachment {
  id: string;
  message_id: string;
  storage_path: string;
  mime_type: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  created_at: string;
}

function mapFrom<T>(rows: any[] | null): T[] { return (rows as T[]) || []; }

export const messagingService = {
  async listConversations(): Promise<Conversation[]> {
    console.log('=== MESSAGING SERVICE: listConversations ===');
    try {
      const { data, error } = await sb
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (error) {
        console.error('List conversations error:', error);
        throw error;
      }
      
      console.log('Conversations listed successfully:', data);
      return (data as unknown) as Conversation[];
    } catch (err) {
      console.error('Service error in listConversations:', err);
      throw err;
    }
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await sb
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (error) throw error;
    return (data as unknown) as Conversation;
  },

  async getMessages(conversationId: string, opts?: { before?: string; limit?: number; }): Promise<Message[]> {
    console.log('=== MESSAGING SERVICE: getMessages ===');
    console.log('Conversation ID:', conversationId);
    
    try {
      let query = sb
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (opts?.before) {
        query = query.lt('created_at', opts.before);
      }
      const { data, error } = await query.limit(opts?.limit ?? 50);
      
      if (error) {
        console.error('Get messages error:', error);
        throw error;
      }
      
      console.log('Messages retrieved successfully:', data);
      // reverse to chronological ascending for UI
      return ((data as unknown) as Message[]).reverse();
    } catch (err) {
      console.error('Service error in getMessages:', err);
      throw err;
    }
  },

  async sendMessage(conversationId: string, content: string, messageType: MessageType = 'text', metadata: any = {}): Promise<Message> {
    console.log('=== MESSAGING SERVICE: sendMessage ===');
    console.log('Conversation ID:', conversationId);
    console.log('Content:', content);
    console.log('Message type:', messageType);
    
    try {
      const { data: { user }, error: userError } = await sb.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      if (!user) {
        console.error('User not authenticated');
        throw new Error('Not authenticated');
      }

      console.log('User authenticated:', user.id);

      const { data, error } = await sb
        .from('messages')
        .insert({ 
          conversation_id: conversationId, 
          sender_id: user.id,
          content, 
          message_type: messageType, 
          metadata 
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Send message error:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      return (data as unknown) as Message;
    } catch (err) {
      console.error('Service error in sendMessage:', err);
      throw err;
    }
  },

  async markRead(conversationId: string): Promise<void> {
    const { data: { user }, error: userError } = await sb.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');
    const { error } = await sb
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);
    if (error) throw error;
  },

  async getOrCreateApplicationConversation(applicationId: string): Promise<string> {
    const { data, error } = await sb
      .rpc('get_or_create_application_conversation', { p_application_id: applicationId });
    if (error) throw error;
    return data as string;
  },

  async getOrCreateDirectConversation(otherUserId: string): Promise<string> {
    const { data, error } = await sb
      .rpc('get_or_create_direct_conversation', { p_other_user_id: otherUserId });
    if (error) throw error;
    return data as string;
  },

  subscribeToConversation(conversationId: string, handlers: {
    onInsert?: (msg: Message) => void;
    onUpdate?: (msg: Message) => void;
    onDelete?: (msg: Message) => void;
  }) {
    const channel = sb
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        handlers.onInsert?.(payload.new as Message);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        handlers.onUpdate?.(payload.new as Message);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
        handlers.onDelete?.(payload.old as Message);
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  },

  async uploadAttachment(conversationId: string, file: File): Promise<Attachment> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `conversations/${conversationId}/${fileName}`;
    const { data, error } = await sb.storage
      .from('message_attachments')
      .upload(path, file, { upsert: false, cacheControl: '3600' });
    if (error) throw error;
    // create message with file metadata
    const meta = { storage_path: data.path, file_name: file.name, size: file.size, mime_type: file.type } as any;
    const msg = await this.sendMessage(conversationId, '', 'file', meta);
    // store attachment row
    const { data: attach, error: aerr } = await sb
      .from('message_attachments')
      .insert({ message_id: msg.id, storage_path: data.path, mime_type: file.type, size: file.size })
      .select('*')
      .single();
    if (aerr) throw aerr;
    return (attach as unknown) as Attachment;
  },

  async getSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await sb.storage.from('message_attachments').createSignedUrl(storagePath, 60);
    if (error) throw error;
    return data.signedUrl as string;
  }
};



