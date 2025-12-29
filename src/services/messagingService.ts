import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  Message,
  ConversationWithMessages,
} from "@/types/messaging";

export class MessagingService {
  // Get all conversations for the current user
  static async getConversations(): Promise<ConversationWithMessages[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    try {
      // Use direct SQL query - simplified to avoid column issues
      const { data, error } = await supabase
        .from("conversations" as any)
        .select("*")
        .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      console.log("Raw conversations data:", data);

      // Get messages and additional info for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv: any) => {
          try {
            // Get messages
            const { data: messages } = await supabase
              .from("messages" as any)
              .select("*")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: true });

            // Get property info
            let propertyTitle = "Unknown Property";
            try {
              const { data: property, error: propertyError } = await supabase
                .from("properties" as any)
                .select("listing_title, address")
                .eq("id", conv.property_id)
                .maybeSingle();

              if (!propertyError && property) {
                propertyTitle =
                  property.listing_title ||
                  property.address ||
                  "Unknown Property";
              } else {
                console.warn(
                  "Could not fetch property:",
                  propertyError,
                  "Property ID:",
                  conv.property_id
                );
              }
            } catch (err) {
              console.error("Error fetching property:", err);
            }

            // Get landlord name from profiles table
            let landlordName = "Landlord";
            try {
              const { data: landlordProfile, error: landlordError } =
                await supabase
                  .from("user_profiles" as any)
                  .select("full_name, email")
                  .eq("id", conv.landlord_id)
                  .maybeSingle();

              if (!landlordError && landlordProfile) {
                landlordName =
                  landlordProfile.full_name ||
                  landlordProfile.email?.split("@")[0] ||
                  "Landlord";
                console.log(
                  "Landlord name fetched:",
                  landlordName,
                  "from profile:",
                  landlordProfile
                );
              } else {
                console.warn(
                  "Could not fetch landlord profile:",
                  landlordError,
                  "Landlord ID:",
                  conv.landlord_id
                );
                // Try RPC function to get from auth.users
                try {
                  const { data: userName, error: rpcError } =
                    await supabase.rpc("get_user_name" as any, {
                      user_id: conv.landlord_id,
                    });

                  if (!rpcError && userName && typeof userName === "string") {
                    landlordName = userName;
                  } else {
                    // Last resort: try to get email from RPC
                    const { data: userEmail } = await supabase.rpc(
                      "get_user_email" as any,
                      { user_id: conv.landlord_id }
                    );

                    if (userEmail && typeof userEmail === "string") {
                      landlordName = userEmail.split("@")[0];
                    } else {
                      landlordName = `User ${conv.landlord_id.substring(0, 8)}`;
                    }
                  }
                } catch (rpcErr) {
                  console.warn("RPC function not available, using fallback");
                  landlordName = `User ${conv.landlord_id.substring(0, 8)}`;
                }
              }
            } catch (err) {
              console.error("Error fetching landlord profile:", err);
            }

            // Get tenant name from profiles table
            let tenantName = "Tenant";
            try {
              const { data: tenantProfile, error: tenantError } = await supabase
                .from("user_profiles" as any)
                .select("full_name, email")
                .eq("id", conv.tenant_id)
                .maybeSingle();

              if (!tenantError && tenantProfile) {
                tenantName =
                  tenantProfile.full_name ||
                  tenantProfile.email?.split("@")[0] ||
                  "Tenant";
                console.log(
                  "Tenant name fetched:",
                  tenantName,
                  "from profile:",
                  tenantProfile
                );
              } else {
                console.warn(
                  "Could not fetch tenant profile:",
                  tenantError,
                  "Tenant ID:",
                  conv.tenant_id
                );
                // Try RPC function to get from auth.users
                try {
                  const { data: userName, error: rpcError } =
                    await supabase.rpc("get_user_name" as any, {
                      user_id: conv.tenant_id,
                    });

                  if (!rpcError && userName && typeof userName === "string") {
                    tenantName = userName;
                  } else {
                    // Last resort: try to get email from RPC
                    const { data: userEmail } = await supabase.rpc(
                      "get_user_email" as any,
                      { user_id: conv.tenant_id }
                    );

                    if (userEmail && typeof userEmail === "string") {
                      tenantName = userEmail.split("@")[0];
                    } else {
                      tenantName = `User ${conv.tenant_id.substring(0, 8)}`;
                    }
                  }
                } catch (rpcErr) {
                  console.warn("RPC function not available, using fallback");
                  tenantName = `User ${conv.tenant_id.substring(0, 8)}`;
                }
              }
            } catch (err) {
              console.error("Error fetching tenant profile:", err);
            }

            return {
              ...conv,
              messages: messages || [],
              property_title: propertyTitle,
              landlord_name: landlordName,
              tenant_name: tenantName,
            } as ConversationWithMessages;
          } catch (messageError) {
            console.error(
              "Error fetching messages for conversation:",
              conv.id,
              messageError
            );
            return {
              ...conv,
              messages: [],
              property_title: "Unknown Property",
              landlord_name: "Landlord",
              tenant_name: "Tenant",
            } as ConversationWithMessages;
          }
        })
      );

      return conversationsWithMessages;
    } catch (error) {
      console.error("Failed to load conversations:", error);
      // Return empty array instead of throwing to prevent app crash
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

      // Check if user is part of this conversation
      if (
        conversation.landlord_id !== user.id &&
        conversation.tenant_id !== user.id
      ) {
        return null;
      }

      // Get messages
      const { data: messages } = await supabase
        .from("messages" as any)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      // Get property info
      let propertyTitle = "Unknown Property";
      try {
        const { data: property, error: propertyError } = await supabase
          .from("properties" as any)
          .select("listing_title, address")
          .eq("id", conversation.property_id)
          .maybeSingle();

        if (!propertyError && property) {
          propertyTitle =
            property.listing_title || property.address || "Unknown Property";
        } else {
          console.warn(
            "Could not fetch property:",
            propertyError,
            "Property ID:",
            conversation.property_id
          );
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }

      // Get landlord name - try profiles first, then RPC function
      let landlordName = "Landlord";
      try {
        // First try profiles table
        const { data: landlordProfile, error: landlordError } = await supabase
          .from("user_profiles" as any)
          .select("full_name, email")
          .eq("id", conversation.landlord_id)
          .maybeSingle();

        if (!landlordError && landlordProfile) {
          landlordName =
            landlordProfile.full_name ||
            landlordProfile.email?.split("@")[0] ||
            "Landlord";
        } else {
          // If profile not found, try RPC function to get from auth.users
          try {
            const { data: userName, error: rpcError } = await supabase.rpc(
              "get_user_name" as any,
              { user_id: conversation.landlord_id }
            );

            if (!rpcError && userName && typeof userName === "string") {
              landlordName = userName;
            } else {
              // Last resort: try to get email from RPC
              const { data: userEmail } = await supabase.rpc(
                "get_user_email" as any,
                { user_id: conversation.landlord_id }
              );

              if (userEmail && typeof userEmail === "string") {
                landlordName = userEmail.split("@")[0];
              }
            }
          } catch (rpcErr) {
            console.warn("RPC function not available, using fallback");
          }
        }
      } catch (err) {
        console.error("Error fetching landlord name:", err);
      }

      // Get tenant name - try profiles first, then RPC function
      let tenantName = "Tenant";
      try {
        // First try profiles table
        const { data: tenantProfile, error: tenantError } = await supabase
          .from("user_profiles" as any)
          .select("full_name, email")
          .eq("id", conversation.tenant_id)
          .maybeSingle();

        if (!tenantError && tenantProfile) {
          tenantName =
            tenantProfile.full_name ||
            tenantProfile.email?.split("@")[0] ||
            "Tenant";
        } else {
          // If profile not found, try RPC function to get from auth.users
          try {
            const { data: userName, error: rpcError } = await supabase.rpc(
              "get_user_name" as any,
              { user_id: conversation.tenant_id }
            );

            if (!rpcError && userName && typeof userName === "string") {
              tenantName = userName;
            } else {
              // Last resort: try to get email from RPC
              const { data: userEmail } = await supabase.rpc(
                "get_user_email" as any,
                { user_id: conversation.tenant_id }
              );

              if (userEmail && typeof userEmail === "string") {
                tenantName = userEmail.split("@")[0];
              }
            }
          } catch (rpcErr) {
            console.warn("RPC function not available, using fallback");
          }
        }
      } catch (err) {
        console.error("Error fetching tenant name:", err);
      }

      return {
        ...conversation,
        messages: messages || [],
        property_title: propertyTitle,
        landlord_name: landlordName,
        tenant_name: tenantName,
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
    tenantId: string
  ): Promise<string> {
    // Check if conversation already exists
    let query = supabase
      .from("conversations" as any)
      .select("id")
      .eq("landlord_id", landlordId)
      .eq("tenant_id", tenantId);

    if (propertyId) {
      query = query.eq("property_id", propertyId);
    } else {
      query = query.is("property_id", null);
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
        landlord_id: landlordId,
        tenant_id: tenantId,
      })
      .select("id")
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

  // Subscribe to conversation updates
  static subscribeToConversations(callback: () => void) {
    return supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        callback
      )
      .subscribe();
  }
}
