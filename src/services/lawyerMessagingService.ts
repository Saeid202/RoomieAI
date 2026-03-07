import { supabase } from "@/integrations/supabase/client";
import { MessagingService } from "./messagingService";

export interface LawyerMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  lawyer_profile_id: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

// Check if conversation should be migrated to main messenger
export async function shouldMigrateToMainMessenger(
  lawyerUserId: string,
  clientUserId: string
): Promise<{ shouldMigrate: boolean; conversationId?: string }> {
  try {
    // Check if there's already a conversation in the main messenger
    const { data: existingConv } = await supabase
      .from("conversations" as any)
      .select("id")
      .or(`and(landlord_id.eq.${lawyerUserId},tenant_id.eq.${clientUserId}),and(landlord_id.eq.${clientUserId},tenant_id.eq.${lawyerUserId})`)
      .is("property_id", null)
      .is("sales_listing_id", null)
      .maybeSingle();

    if (existingConv) {
      return { shouldMigrate: true, conversationId: (existingConv as any).id };
    }

    // Check if there are messages from both parties (indicating active conversation)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { shouldMigrate: false };

    const { data: lawyerProfile } = await supabase
      .from('lawyer_profiles' as any)
      .select('id')
      .eq('user_id', lawyerUserId)
      .single();

    if (!lawyerProfile) return { shouldMigrate: false };

    // Count messages from each party
    const { data: messages } = await supabase
      .from('lawyer_messages' as any)
      .select('sender_id')
      .eq('lawyer_profile_id', (lawyerProfile as any).id)
      .or(`sender_id.eq.${lawyerUserId},sender_id.eq.${clientUserId}`);

    if (!messages || messages.length < 2) {
      return { shouldMigrate: false };
    }

    // Check if both parties have sent at least one message
    const lawyerSent = messages.some((m: any) => m.sender_id === lawyerUserId);
    const clientSent = messages.some((m: any) => m.sender_id === clientUserId);

    if (lawyerSent && clientSent) {
      // Create conversation in main messenger
      const conversationId = await MessagingService.startDirectChat(lawyerUserId, clientUserId);
      return { shouldMigrate: true, conversationId };
    }

    return { shouldMigrate: false };
  } catch (error) {
    console.error("Error checking migration status:", error);
    return { shouldMigrate: false };
  }
}

export interface LawyerConversation {
  lawyer_profile_id: string;
  lawyer_name: string;
  lawyer_firm: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export async function sendMessageToLawyer(
  lawyerUserId: string,
  lawyerProfileId: string,
  message: string
): Promise<LawyerMessage | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("lawyer_messages")
    .insert({
      sender_id: user.id,
      recipient_id: lawyerUserId,
      lawyer_profile_id: lawyerProfileId,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }
  return data;
}

export async function fetchConversationMessages(
  lawyerProfileId: string
): Promise<LawyerMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("lawyer_messages")
    .select("*")
    .eq("lawyer_profile_id", lawyerProfileId)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
  return data || [];
}

export async function markMessagesAsRead(
  lawyerProfileId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("lawyer_messages")
    .update({ read: true })
    .eq("lawyer_profile_id", lawyerProfileId)
    .eq("recipient_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

export async function fetchUserConversations(): Promise<LawyerConversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch all conversations for this user
  const { data, error } = await supabase
    .from("lawyer_messages")
    .select(`
      *,
      lawyer_profile:lawyer_profiles!lawyer_profile_id (
        full_name,
        law_firm_name
      )
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }

  // Group by lawyer_profile_id
  const conversationsMap = new Map<string, LawyerConversation>();
  
  (data || []).forEach((msg: any) => {
    const lawyerProfileId = msg.lawyer_profile_id;
    if (!conversationsMap.has(lawyerProfileId)) {
      conversationsMap.set(lawyerProfileId, {
        lawyer_profile_id: lawyerProfileId,
        lawyer_name: msg.lawyer_profile?.full_name || "Unknown",
        lawyer_firm: msg.lawyer_profile?.law_firm_name || null,
        last_message: msg.message,
        last_message_time: msg.created_at,
        unread_count: msg.recipient_id === user.id && !msg.read ? 1 : 0,
      });
    } else {
      const conv = conversationsMap.get(lawyerProfileId)!;
      if (msg.recipient_id === user.id && !msg.read) {
        conv.unread_count++;
      }
    }
  });

  return Array.from(conversationsMap.values());
}
