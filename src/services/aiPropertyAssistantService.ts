// =====================================================
// AI Property Assistant Service
// =====================================================
// Purpose: Client-side service for RAG-based property Q&A
// =====================================================

import { supabase } from "@/integrations/supabase/client";
import type {
  AIAssistantRequest,
  AIAssistantResponse,
  AIConversationMessage,
  AIPropertyConversation,
  ProcessDocumentRequest,
  ProcessDocumentResponse,
  DocumentProcessingStatus,
  PropertyAIReadiness,
} from "@/types/aiPropertyAssistant";

/**
 * Process a document for AI indexing
 * Triggers the Edge Function to extract text and generate embeddings
 */
export async function processDocumentForAI(
  documentId: string,
  propertyId: string,
  documentUrl: string,
  documentType: string
): Promise<ProcessDocumentResponse> {
  try {
    console.log("🔵 Processing document for AI:", { documentId, documentType });

    const { data, error } = await supabase.functions.invoke(
      "process-property-document-simple",
      {
        body: {
          documentId,
          propertyId,
          documentUrl,
          documentType,
        } as ProcessDocumentRequest,
      }
    );

    if (error) {
      console.error("❌ Edge Function Error Status:", error.status);
      try {
        const errorBody = await error.context.json();
        console.error("❌ Edge Function Error Detail:", errorBody);
      } catch (e) {
        console.error("❌ Could not parse error body as JSON");
      }
      throw error;
    }

    console.log("✅ Document processed:", data);
    return data as ProcessDocumentResponse;
  } catch (error: any) {
    console.error("❌ Failed to process document:", error.message || error);
    throw error;
  }
}

/**
 * Send a message to the AI Property Assistant
 */
export async function sendMessageToAI(
  propertyId: string,
  message: string,
  conversationHistory: AIConversationMessage[] = []
): Promise<AIAssistantResponse> {
  try {
    console.log("🤖 Sending message to AI:", { propertyId, message });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Format conversation history for API
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const { data, error } = await supabase.functions.invoke(
      "ai-property-assistant",
      {
        body: {
          propertyId,
          userId: user.id,
          message,
          conversationHistory: formattedHistory,
        } as AIAssistantRequest,
      }
    );

    if (error) {
      console.error("❌ Error from AI assistant:", error);
      throw error;
    }

    console.log("✅ AI response received:", data);
    return data as AIAssistantResponse;
  } catch (error) {
    console.error("❌ Failed to get AI response:", error);
    throw error;
  }
}

/**
 * Get conversation history for a property
 */
export async function getConversationHistory(
  propertyId: string,
  limit: number = 10
): Promise<AIConversationMessage[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase.rpc(
      "get_property_conversation_history",
      {
        p_property_id: propertyId,
        p_user_id: user.id,
        p_limit: limit,
      }
    );

    if (error) {
      console.error("❌ Error fetching conversation history:", error);
      throw error;
    }

    // Convert database format to UI format
    const conversations = data as AIPropertyConversation[];
    const messages: AIConversationMessage[] = [];

    conversations.reverse().forEach((conv) => {
      // Add user message
      messages.push({
        id: `${conv.id}-user`,
        role: "user",
        content: conv.user_message,
        timestamp: conv.created_at,
      });

      // Add AI response
      messages.push({
        id: `${conv.id}-assistant`,
        role: "assistant",
        content: conv.ai_response,
        citations: conv.citations,
        timestamp: conv.created_at,
        tokensUsed: conv.tokens_used,
        responseTime: conv.response_time_ms,
      });
    });

    return messages;
  } catch (error) {
    console.error("❌ Failed to fetch conversation history:", error);
    return [];
  }
}

/**
 * Get document processing status
 */
export async function getDocumentProcessingStatus(
  documentId: string
): Promise<DocumentProcessingStatus | null> {
  try {
    const { data, error } = await supabase
      .from("property_document_processing_status")
      .select("*")
      .eq("document_id", documentId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No status found - document not yet processed
        return null;
      }
      throw error;
    }

    return data as DocumentProcessingStatus;
  } catch (error) {
    console.error("❌ Failed to fetch processing status:", error);
    return null;
  }
}

/**
 * Get all document processing statuses for a property
 */
export async function getPropertyProcessingStatuses(
  propertyId: string
): Promise<DocumentProcessingStatus[]> {
  try {
    const { data, error } = await supabase
      .from("property_document_processing_status")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []) as DocumentProcessingStatus[];
  } catch (error) {
    console.error("❌ Failed to fetch property processing statuses:", error);
    return [];
  }
}

/**
 * Check if property is ready for AI assistant
 */
export async function checkPropertyAIReadiness(
  propertyId: string
): Promise<PropertyAIReadiness> {
  try {
    // Get all documents for property
    const { data: documents, error: docsError } = await supabase
      .from("property_documents")
      .select("id, file_url, document_type")
      .eq("property_id", propertyId)
      .is("deleted_at", null);

    if (docsError) throw docsError;

    const totalDocuments = documents?.length || 0;

    if (totalDocuments === 0) {
      return {
        isReady: false,
        totalDocuments: 0,
        processedDocuments: 0,
        pendingDocuments: 0,
        failedDocuments: 0,
        processingDocuments: 0,
      };
    }

    // Get processing statuses
    const statuses = await getPropertyProcessingStatuses(propertyId);

    // DISABLED: Auto-trigger processing is causing issues with broken Edge Function
    // Documents should be processed manually or via a working Edge Function
    // Identify documents that haven't even started processing (missing status record)
    const processedDocIds = new Set(statuses.map(s => s.document_id));
    const unprocessedDocs = documents.filter(doc => !processedDocIds.has(doc.id));

    if (unprocessedDocs.length > 0) {
      console.log(`⚠️ Found ${unprocessedDocs.length} unprocessed documents (auto-trigger disabled)`);
    }

    const processedDocuments = statuses.filter(
      (s) => s.status === "completed"
    ).length;
    const pendingDocuments = statuses.filter(
      (s) => s.status === "pending"
    ).length + unprocessedDocs.length; // Count untriggered ones as pending
    const failedDocuments = statuses.filter(
      (s) => s.status === "failed"
    ).length;
    const processingDocuments = statuses.filter(
      (s) => s.status === "processing"
    ).length;

    // Property is ready if at least one document is processed
    const isReady = processedDocuments > 0;

    return {
      isReady,
      totalDocuments,
      processedDocuments,
      pendingDocuments,
      failedDocuments,
      processingDocuments,
    };
  } catch (error) {
    console.error("❌ Failed to check AI readiness:", error);
    return {
      isReady: false,
      totalDocuments: 0,
      processedDocuments: 0,
      pendingDocuments: 0,
      failedDocuments: 0,
      processingDocuments: 0,
    };
  }
}

/**
 * Retry failed document processing
 */
export async function retryDocumentProcessing(
  documentId: string,
  propertyId: string,
  documentUrl: string,
  documentType: string
): Promise<ProcessDocumentResponse> {
  try {
    console.log("🔄 Retrying document processing:", documentId);

    // Reset status to pending
    await supabase
      .from("property_document_processing_status")
      .update({
        status: "pending",
        error_message: null,
        started_at: null,
        completed_at: null,
      })
      .eq("document_id", documentId);

    // Trigger processing
    return await processDocumentForAI(
      documentId,
      propertyId,
      documentUrl,
      documentType
    );
  } catch (error) {
    console.error("❌ Failed to retry processing:", error);
    throw error;
  }
}

/**
 * Delete all embeddings for a document
 */
export async function deleteDocumentEmbeddings(
  documentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("property_document_embeddings")
      .delete()
      .eq("document_id", documentId);

    if (error) throw error;

    // Also delete processing status
    await supabase
      .from("property_document_processing_status")
      .delete()
      .eq("document_id", documentId);

    console.log("✅ Document embeddings deleted:", documentId);
  } catch (error) {
    console.error("❌ Failed to delete embeddings:", error);
    throw error;
  }
}

/**
 * Get AI usage statistics for a property
 */
export async function getPropertyAIStats(propertyId: string): Promise<{
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  averageResponseTime: number;
}> {
  try {
    const { data, error } = await supabase
      .from("ai_property_conversations")
      .select("tokens_used, response_time_ms")
      .eq("property_id", propertyId);

    if (error) throw error;

    const conversations = data || [];
    const totalConversations = conversations.length;
    const totalMessages = totalConversations * 2; // User + AI
    const totalTokensUsed = conversations.reduce(
      (sum, conv) => sum + (conv.tokens_used || 0),
      0
    );
    const averageResponseTime =
      conversations.reduce(
        (sum, conv) => sum + (conv.response_time_ms || 0),
        0
      ) / (totalConversations || 1);

    return {
      totalConversations,
      totalMessages,
      totalTokensUsed,
      averageResponseTime: Math.round(averageResponseTime),
    };
  } catch (error) {
    console.error("❌ Failed to fetch AI stats:", error);
    return {
      totalConversations: 0,
      totalMessages: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
    };
  }
}
