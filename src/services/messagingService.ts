import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  Message,
  ConversationWithMessages,
} from "@/types/messaging";

export class MessagingService {
  // Get all conversations for the current user
  // Get all conversations for the current user
  static async getConversations(): Promise<ConversationWithMessages[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      // 1. Fetch all conversations matching the user
      const { data: convData, error } = await supabase
        .from("conversations" as any)
        .select("*")
        .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      if (!convData || convData.length === 0) return [];

      // 2. Prepare batch lists for context fetching
      const participantIds = [...new Set(convData.flatMap((c: any) => [c.landlord_id, c.tenant_id]))];
      const propertyIds = convData.map((c: any) => c.property_id).filter(Boolean);
      const jobIds = convData.map((c: any) => c.emergency_job_id).filter(Boolean);
      const salesIds = convData.map((c: any) => c.sales_listing_id).filter(Boolean);

      // 3. Batch fetch all necessary data in parallel
      const [
        { data: profiles },
        { data: renovators },
        { data: properties },
        { data: jobs },
        { data: sales },
        { data: lastMessages }
      ] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, full_name, email").in("id", participantIds),
        supabase.from("renovation_partners" as any).select("user_id, company, name").in("user_id", participantIds),
        supabase.from("properties" as any).select("id, listing_title, address").in("id", propertyIds),
        supabase.from("emergency_jobs" as any).select("id, category, unit_address, status").in("id", jobIds),
        supabase.from("sales_listings" as any).select("id, listing_title, address").in("id", salesIds),
        supabase.from("messages" as any).select("*").in("conversation_id", convData.map((c: any) => c.id)).order("created_at", { ascending: false })
      ]);

      // 4. Map the data for quick access
      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
      const renovatorMap = new Map(renovators?.map((r: any) => [r.user_id, r]) || []);
      const propertyMap = new Map(properties?.map((p: any) => [p.id, p]) || []);
      const jobMap = new Map(jobs?.map((j: any) => [j.id, j]) || []);
      const salesMap = new Map(sales?.map((s: any) => [s.id, s]) || []);

      const lastMsgMap = new Map();
      lastMessages?.forEach((m: any) => {
        if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m);
      });

      // Helper to resolve name
      const resolveName = (uid: string) => {
        // Try renovator
        const r = renovatorMap.get(uid) as any;
        if (r) {
          if (r.company && r.name) return `${r.company} (${r.name})`;
          return r.company || r.name;
        }
        // Try profile
        const p = profileMap.get(uid) as any;
        if (p) {
          if (p.first_name || p.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
          if (p.full_name) return p.full_name;
          if (p.email) return p.email.split('@')[0];
        }
        return `User ${uid.substring(0, 5)}`;
      };

      // 5. Build the final objects
      const conversations = convData.map((conv: any) => {
        let propertyTitle = "Unknown Property";
        let emergencyJob = null;

        if (conv.emergency_job_id) {
          const job = jobMap.get(conv.emergency_job_id) as any;
          if (job) {
            propertyTitle = `🚨 Emergency: ${job.category}`;
            emergencyJob = job;
          }
        } else if (conv.property_id) {
          const prop = propertyMap.get(conv.property_id) as any;
          if (prop) propertyTitle = prop.listing_title || prop.address || "Rental Property";
        } else if (conv.sales_listing_id) {
          const sl = salesMap.get(conv.sales_listing_id) as any;
          if (sl) propertyTitle = sl.listing_title || sl.address || "Sales Listing";
        }

        if (conv.co_ownership_group_id) {
          propertyTitle = `🏠 Group Co-buy: ${propertyTitle}`;
        }

        const lastMsg = lastMsgMap.get(conv.id);

        return {
          ...conv,
          messages: lastMsg ? [lastMsg] : [],
          property_title: propertyTitle,
          landlord_name: resolveName(conv.landlord_id),
          tenant_name: resolveName(conv.tenant_id),
          emergency_job: emergencyJob,
          last_message_at: lastMsg?.created_at || conv.last_message_at || conv.created_at
        } as ConversationWithMessages;
      });

      return conversations.sort((a, b) =>
        new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      );
    } catch (error) {
      console.error("Failed to load optimized conversations:", error);
      return [];
    }
  }

  // Get a single conversation by ID
  static async getConversationById(
    conversationId: string
  ): Promise<ConversationWithMessages | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      const { data: conversation, error } = await supabase
        .from("conversations" as any)
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error || !conversation) {
        return null;
      }

      // Check access
      if (
        (conversation as any).landlord_id !== user.id &&
        (conversation as any).tenant_id !== user.id
      ) {
        if (!(conversation as any).co_ownership_group_id) return null;
        const { data: member } = await supabase
          .from("co_ownership_group_members" as any)
          .select("user_id")
          .eq("group_id", (conversation as any).co_ownership_group_id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!member) return null;
      }

      // Get messages
      const { data: messages } = await supabase
        .from("messages" as any)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      // Get property/context info (Simpler fetch for single)
      let propertyTitle = "Unknown Property";
      let emergencyJob = null;
      // Re-implementing context fetching to ensure no loss
      const c = conversation as any;
      if (c.emergency_job_id) {
        const { data: job } = await supabase.from('emergency_jobs' as any).select('*').eq('id', c.emergency_job_id).maybeSingle();
        const j = job as any;
        if (j) { propertyTitle = `🚨 Emergency: ${j.category}`; emergencyJob = j; }
      } else if (c.property_id) {
        const { data: p } = await supabase.from("properties" as any).select("listing_title, address").eq("id", c.property_id).maybeSingle();
        const prop = p as any;
        if (prop) propertyTitle = prop.listing_title || prop.address || "Unknown Property";
      } else if (c.sales_listing_id) {
        const { data: s } = await supabase.from("sales_listings" as any).select("listing_title, address").eq("id", c.sales_listing_id).maybeSingle();
        const sl = s as any;
        if (sl) propertyTitle = sl.listing_title || sl.address || "Sales Listing";
      }
      if (c.co_ownership_group_id) propertyTitle = `🏠 Group Co-buy: ${propertyTitle}`;


      // Helper to fetch name for one user
      const fetchName = async (uid: string) => {
        // Try Renovator
        const { data: rResult } = await supabase.from('renovation_partners' as any).select('company, name').eq('user_id', uid).maybeSingle();
        const r = rResult as any;
        if (r) return (r.company && r.name) ? `${r.company} (${r.name})` : (r.company || r.name);

        // Try Profile
        const { data: pResult } = await supabase.from('profiles').select('first_name, last_name, full_name, email').eq('id', uid).maybeSingle();
        const p = pResult as any;
        if (p) {
          if (p.first_name || p.last_name) return `${p.first_name || ''} ${p.last_name || ''}`.trim();
          if (p.full_name) return p.full_name;
          if (p.email) return p.email.split('@')[0];
        }
        return `User ${uid.substring(0, 5)}`;
      };

      const [landlordName, tenantName] = await Promise.all([
        fetchName(c.landlord_id),
        fetchName(c.tenant_id)
      ]);

      return {
        ...c,
        messages: messages || [],
        property_title: propertyTitle,
        landlord_name: landlordName,
        tenant_name: tenantName,
        emergency_job: emergencyJob
      } as ConversationWithMessages;

    } catch (error) {
      console.error("Failed to load conversation:", error);
      return null;
    }
  }

  // Get messages for a specific conversation
  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages" as any)
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as Message[];
  }

  // Send a message
  static async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: message, error } = await supabase
      .from("messages" as any)
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last_message_at
    await supabase
      .from("conversations" as any)
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return message as unknown as Message;
  }

  // Create or get existing conversation
  static async getOrCreateConversation(
    propertyId: string | null,
    landlordId: string,
    tenantId: string,
    salesListingId?: string | null
  ): Promise<string> {
    // Check if conversation already exists
    let query = supabase
      .from("conversations" as any)
      .select("id")
      .eq("landlord_id", landlordId)
      .eq("tenant_id", tenantId);

    if (propertyId) {
      query = query.eq("property_id", propertyId);
    } else if (salesListingId) {
      query = query.eq("sales_listing_id", salesListingId);
    } else {
      query = query.is("property_id", null).is("sales_listing_id", null);
    }

    const { data: existingConversation, error: fetchError } = await query.single();

    if (existingConversation && !fetchError) {
      return (existingConversation as any).id;
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from("conversations" as any)
      .insert({
        property_id: propertyId,
        sales_listing_id: salesListingId || null,
        landlord_id: landlordId,
        tenant_id: tenantId,
      })
      .select("id")
      .single();

    if (createError) throw createError;
    return (newConversation as any).id;
  }

  static async joinCoOwnershipGroup(
    salesListingId: string,
    userId: string,
    landlordId: string
  ): Promise<string> {
    try {
      console.log('Joining co-ownership group for listing:', salesListingId);

      // 1. Get or create co-ownership group
      let { data: group, error: groupError } = await supabase
        .from("co_ownership_groups" as any)
        .select("id")
        .eq("sales_listing_id", salesListingId)
        .maybeSingle();

      if (groupError) throw groupError;

      if (!group) {
        console.log('Creating new co-ownership group...');
        const { data: newGroup, error: createGroupError } = await supabase
          .from("co_ownership_groups" as any)
          .insert({ sales_listing_id: salesListingId })
          .select("id")
          .single();
        if (createGroupError) throw createGroupError;
        group = newGroup;
      }

      // 2. Join the group
      console.log('Adding user to group members...');
      const { error: joinError } = await supabase
        .from("co_ownership_group_members" as any)
        .upsert({
          group_id: (group as any).id,
          user_id: userId
        });

      if (joinError) {
        console.error('Error joining group:', joinError);
        // Continue anyway if it's just a duplicate Join
      }

      // 3. Find/Create group conversation
      console.log('Fetching/creating group conversation...');
      const { data: existingConv } = await supabase
        .from("conversations" as any)
        .select("id")
        .eq("co_ownership_group_id", (group as any).id)
        .maybeSingle();

      if (existingConv) {
        console.log('Found existing group conversation:', (existingConv as any).id);
        return (existingConv as any).id;
      }

      console.log('Creating initial group conversation record...');
      const { data: newConv, error: convError } = await supabase
        .from("conversations" as any)
        .insert({
          co_ownership_group_id: (group as any).id,
          sales_listing_id: salesListingId,
          landlord_id: landlordId,
          tenant_id: userId // First joiner establishes the initial row context
        })
        .select("id")
        .single();

      if (convError) throw convError;
      console.log('Created new group conversation:', (newConv as any).id);
      return (newConv as any).id;
    } catch (error) {
      console.error('Failed to join co-ownership group:', error);
      throw error;
    }
  }

  // Subscribe to real-time message updates
  static subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to conversation updates (and any message additions)
  static subscribeToConversations(callback: () => void) {
    const userConvChannel = supabase
      .channel("conversations-list-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        callback
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        callback
      )
      .subscribe();

    return userConvChannel;
  }

  // Start a direct chat (roommate matching) - checks both directions
  static async startDirectChat(
    currentUserId: string,
    otherUserId: string
  ): Promise<string> {
    // 1. Check current user as landlord, other user as tenant
    const { data: conv1 } = await supabase
      .from("conversations" as any)
      .select("id")
      .eq("landlord_id", currentUserId)
      .eq("tenant_id", otherUserId)
      .is("property_id", null)
      .maybeSingle();

    if (conv1) return (conv1 as any).id;

    // 2. Check other user as landlord, current user as tenant
    const { data: conv2 } = await supabase
      .from("conversations" as any)
      .select("id")
      .eq("landlord_id", otherUserId)
      .eq("tenant_id", currentUserId)
      .is("property_id", null)
      .maybeSingle();

    if (conv2) return (conv2 as any).id;

    // 3. Create new (current user as landlord, other user as tenant)
    // Note: In a roommate context, "landlord" just means "initiator" or "user 1"
    const { data: newConv, error } = await supabase
      .from("conversations" as any)
      .insert({
        landlord_id: currentUserId,
        tenant_id: otherUserId,
        property_id: null
      })
      .select("id")
      .single();

    if (error) throw error;
    return (newConv as any).id;
  }

  // Start a chat specifically for an emergency job
  static async startEmergencyChat(
    jobId: string,
    landlordId: string,
    renovatorUserId: string
  ): Promise<string> {
    // Check if conversation already exists for this job and renovator
    const { data: existingConv } = await supabase
      .from("conversations" as any)
      .select("id")
      .eq("emergency_job_id", jobId)
      .eq("tenant_id", renovatorUserId) // Renovator acts as the "tenant" in this bidirectional model
      .maybeSingle();

    if (existingConv) return (existingConv as any).id;

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations" as any)
      .insert({
        emergency_job_id: jobId,
        landlord_id: landlordId,
        tenant_id: renovatorUserId,
        property_id: null
      })
      .select("id")
      .single();

    if (error) throw error;
    return (newConv as any).id;
  }
}
