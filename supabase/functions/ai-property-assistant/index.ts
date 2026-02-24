// =====================================================
// AI Property Assistant - Edge Function
// =====================================================
// Purpose: RAG-based Q&A system for property documents
//          with strict fact-only responses and citations
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssistantRequest {
  propertyId: string;
  userId: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface Citation {
  documentType: string;
  documentCategory: string;
  content: string;
  pageNumber?: number;
  sectionTitle?: string;
  similarity: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { propertyId, userId, message, conversationHistory }: AssistantRequest =
      await req.json();

    console.log("🤖 AI Assistant query:", { propertyId, userId, message });

    // Detect if this is a command or a question
    const intent = detectIntent(message);
    console.log("🎯 Detected intent:", intent);

    // Handle commands
    if (intent === "command") {
      const commandResponse = await handleCommand(
        message,
        propertyId,
        userId,
        supabase
      );
      
      if (commandResponse) {
        return new Response(
          JSON.stringify({
            success: true,
            response: commandResponse.message,
            isCommand: true,
            commandType: commandResponse.type,
            commandData: commandResponse.data,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Step 1: Verify user has access to this property
    const hasAccess = await verifyPropertyAccess(supabase, propertyId, userId);
    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You do not have access to this property's documents",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Step 2: Generate embedding for user's question
    console.log("🧠 Generating query embedding...");
    const queryEmbedding = await generateEmbedding(message, geminiApiKey);

    // Step 3: Search for relevant document chunks
    console.log("🔍 Searching for relevant documents...");
    const { data: relevantChunks, error: searchError } = await supabase.rpc(
      "search_property_documents",
      {
        p_property_id: propertyId,
        p_query_embedding: queryEmbedding, // Pass as array, not JSON string
        p_match_threshold: 0.7,
        p_match_count: 5,
      }
    );

    if (searchError) {
      console.error("❌ Search error:", searchError);
      throw searchError;
    }

    console.log(`✅ Found ${relevantChunks?.length || 0} relevant chunks`);

    // Step 4: Build context from relevant chunks
    const context = buildContext(relevantChunks || []);
    const citations: Citation[] = (relevantChunks || []).map((chunk: any) => ({
      documentType: chunk.document_type,
      documentCategory: chunk.document_category,
      content: chunk.content.substring(0, 200) + "...",
      pageNumber: chunk.page_number,
      sectionTitle: chunk.section_title,
      similarity: chunk.similarity,
    }));

    // Step 5: Generate AI response with strict system rules
    console.log("💬 Generating AI response...");
    const aiResponse = await generateAIResponse(
      message,
      context,
      conversationHistory || [],
      geminiApiKey
    );

    const responseTime = Date.now() - startTime;

    // Step 6: Save conversation to database
    const { error: saveError } = await supabase
      .from("ai_property_conversations")
      .insert({
        property_id: propertyId,
        user_id: userId,
        user_message: message,
        ai_response: aiResponse.content,
        citations: citations,
        response_time_ms: responseTime,
        tokens_used: aiResponse.tokensUsed,
        model_used: "gemini-2.5-flash",
      });

    if (saveError) {
      console.error("⚠️ Failed to save conversation:", saveError);
      // Don't fail the request, just log the error
    }

    console.log(`✅ Response generated in ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse.content,
        citations,
        responseTime,
        tokensUsed: aiResponse.tokensUsed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in AI assistant:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as any).message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// =====================================================
// Helper Functions
// =====================================================

/**
 * Verify user has access to property documents
 */
async function verifyPropertyAccess(
  supabase: any,
  propertyId: string,
  userId: string
): Promise<boolean> {
  // Check if user is the property owner
  const { data: property } = await supabase
    .from("properties")
    .select("owner_id")
    .eq("id", propertyId)
    .single();

  if (property?.owner_id === userId) {
    return true;
  }

  // Check if user has approved document access request
  const { data: accessRequest } = await supabase
    .from("document_access_requests")
    .select("status")
    .eq("property_id", propertyId)
    .eq("requester_id", userId)
    .eq("status", "approved")
    .single();

  return !!accessRequest;
}

/**
 * Build context string from relevant chunks
 */
function buildContext(chunks: any[]): string {
  if (chunks.length === 0) {
    return "No relevant documents found.";
  }

  return chunks
    .map((chunk, index) => {
      const source = `[${chunk.document_category} - ${chunk.document_type}${chunk.page_number ? `, Page ${chunk.page_number}` : ""
        }]`;
      return `${source}\n${chunk.content}\n`;
    })
    .join("\n---\n\n");
}

/**
 * Generate AI response with strict system rules
 * Uses Google Gemini 1.5 Flash (Free tier: 15 RPM, 1M tokens/day)
 */
async function generateAIResponse(
  userMessage: string,
  context: string,
  conversationHistory: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<{ content: string; tokensUsed: number }> {
  const systemPrompt = `You are an AI Property Assistant for a real estate transaction platform. Your role is to help buyers understand property documents during their due diligence process.

CRITICAL RULES:
1. FACT-ONLY CONSTRAINT: You must ONLY answer based on the provided document context. If information is not in the documents, you MUST say: "I'm sorry, that information is not available in the provided disclosures. Please contact the owner for clarification."

2. CITATION REQUIREMENT: Every answer MUST end with a reference to the source document. Format: "Source: [Document Category - Document Type]" (e.g., "Source: Governance - Condo Bylaws, Section 4.2")

3. NEUTRAL PROFESSIONALISM: Remain objective. Never say "This is a great deal" or make value judgments. Instead, state facts: "The documents show the roof was replaced in 2022."

4. NO SPECULATION: Do not infer, assume, or extrapolate beyond what is explicitly stated in the documents.

5. PRIVACY AWARENESS: Only discuss information from documents the user has been granted access to.

6. STRUCTURED RESPONSES: When answering:
   - Start with a direct answer
   - Provide relevant details from the documents
   - End with the citation

DOCUMENT CONTEXT:
${context}

If the context is empty or doesn't contain relevant information, you MUST respond with the standard "information not available" message.`;

  // Build conversation history for Gemini format
  const contents = [];

  // Add system instruction as first user message
  contents.push({
    role: "user",
    parts: [{ text: systemPrompt }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "I understand. I will only provide factual information from the documents and always include citations." }],
  });

  // Add conversation history (last 5 messages)
  conversationHistory.slice(-5).forEach((msg) => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  });

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.candidates[0].content.parts[0].text,
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
  };
}

/**
 * Generate embedding using Google Gemini API
 * Uses gemini-embedding-001 model (3072 dimensions, truncated to 2000)
 * MUST match the model used in process-property-document-simple
 */
async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const fullEmbedding = data.embedding.values;
  
  // Truncate to 2000 dimensions to match database schema
  // (pgvector HNSW max is 2000, we use IVFFlat with 2000)
  return fullEmbedding.slice(0, 2000);
}

// =====================================================
// Command Detection and Handling
// =====================================================

interface CommandResponse {
  type: string;
  message: string;
  data?: any;
}

/**
 * Detect if message is a command or a question
 */
function detectIntent(message: string): "command" | "question" {
  const commandKeywords = [
    "process",
    "reprocess",
    "status",
    "help",
    "list documents",
    "show documents",
    "what documents",
  ];

  const lowerMessage = message.toLowerCase().trim();

  for (const keyword of commandKeywords) {
    if (lowerMessage.includes(keyword)) {
      return "command";
    }
  }

  return "question";
}

/**
 * Handle chat commands
 */
async function handleCommand(
  command: string,
  propertyId: string,
  userId: string,
  supabase: any
): Promise<CommandResponse | null> {
  const lowerCommand = command.toLowerCase();

  if (lowerCommand.includes("process")) {
    return await handleProcessCommand(propertyId, userId, supabase);
  }

  if (lowerCommand.includes("status")) {
    return await handleStatusCommand(propertyId, supabase);
  }

  if (lowerCommand.includes("help")) {
    return handleHelpCommand();
  }

  if (lowerCommand.includes("list") || lowerCommand.includes("show") || lowerCommand.includes("what documents")) {
    return await handleListDocumentsCommand(propertyId, supabase);
  }

  // Not a recognized command, treat as question
  return null;
}

/**
 * Handle "process documents" command
 */
async function handleProcessCommand(
  propertyId: string,
  userId: string,
  supabase: any
): Promise<CommandResponse> {
  try {
    // Get all documents for property
    const { data: documents, error: docsError } = await supabase
      .from("property_documents")
      .select("id, file_url, document_type, document_label")
      .eq("property_id", propertyId)
      .is("deleted_at", null);

    if (docsError) throw docsError;

    if (!documents || documents.length === 0) {
      return {
        type: "info",
        message: "No documents found for this property. Please upload some documents first, then I can process them!",
      };
    }

    // Check which are already processed
    const { data: statuses } = await supabase
      .from("property_document_processing_status")
      .select("document_id, status")
      .eq("property_id", propertyId);

    const processedIds = new Set(
      statuses?.filter((s: any) => s.status === "completed").map((s: any) => s.document_id) || []
    );

    const unprocessed = documents.filter((d: any) => !processedIds.has(d.id));

    if (unprocessed.length === 0) {
      return {
        type: "info",
        message: `✅ All ${documents.length} document(s) are already processed! You can ask me questions now.\n\n💡 Try asking:\n• "What are the pet policies?"\n• "Tell me about maintenance fees"\n• "What did the inspection find?"`,
      };
    }

    // Trigger processing for each unprocessed document
    const results = [];
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    for (const doc of unprocessed) {
      try {
        // Call the processing Edge Function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/process-property-document-simple`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              documentId: doc.id,
              propertyId,
              documentUrl: doc.file_url,
              documentType: doc.document_type,
            }),
          }
        );

        if (response.ok) {
          results.push({ doc: doc.document_label, status: "started" });
        } else {
          results.push({ doc: doc.document_label, status: "failed" });
        }
      } catch (error) {
        console.error(`Failed to trigger processing for ${doc.id}:`, error);
        results.push({ doc: doc.document_label, status: "failed" });
      }
    }

    const successCount = results.filter((r) => r.status === "started").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    let message = `⚡ I'm processing ${successCount} document(s) now. This will take a few minutes depending on the size.\n\n`;
    
    message += "📄 Processing:\n";
    results.forEach((r) => {
      const icon = r.status === "started" ? "⏳" : "❌";
      message += `${icon} ${r.doc}\n`;
    });

    if (failedCount > 0) {
      message += `\n⚠️ ${failedCount} document(s) failed to start. Please try again or contact support.`;
    } else {
      message += "\n✨ I'll let you know when everything is ready! You can continue asking questions about already processed documents.";
    }

    return {
      type: "processing",
      message,
      data: { results, total: unprocessed.length, success: successCount, failed: failedCount },
    };
  } catch (error) {
    console.error("Error in handleProcessCommand:", error);
    return {
      type: "error",
      message: "Sorry, I encountered an error while trying to process documents. Please try again.",
    };
  }
}

/**
 * Handle "status" command
 */
async function handleStatusCommand(
  propertyId: string,
  supabase: any
): Promise<CommandResponse> {
  try {
    // Get all documents
    const { data: documents } = await supabase
      .from("property_documents")
      .select("id")
      .eq("property_id", propertyId)
      .is("deleted_at", null);

    const totalDocs = documents?.length || 0;

    if (totalDocs === 0) {
      return {
        type: "info",
        message: "No documents found for this property.",
      };
    }

    // Get processing statuses
    const { data: statuses } = await supabase
      .from("property_document_processing_status")
      .select("document_id, status, document_type, total_chunks, processed_chunks")
      .eq("property_id", propertyId);

    const completed = statuses?.filter((s: any) => s.status === "completed") || [];
    const processing = statuses?.filter((s: any) => s.status === "processing") || [];
    const pending = statuses?.filter((s: any) => s.status === "pending") || [];
    const failed = statuses?.filter((s: any) => s.status === "failed") || [];

    const processedIds = new Set(statuses?.map((s: any) => s.document_id) || []);
    const unprocessed = totalDocs - processedIds.size;

    let message = "📊 Processing Status:\n\n";

    if (completed.length > 0) {
      const totalChunks = completed.reduce((sum: number, s: any) => sum + (s.total_chunks || 0), 0);
      message += `✅ ${completed.length} document(s) completed (${totalChunks} chunks)\n`;
    }

    if (processing.length > 0) {
      message += `⏳ ${processing.length} document(s) currently processing\n`;
      processing.forEach((s: any) => {
        const progress = s.total_chunks > 0 
          ? Math.round((s.processed_chunks / s.total_chunks) * 100)
          : 0;
        message += `   • ${s.document_type}: ${progress}%\n`;
      });
    }

    if (pending.length > 0) {
      message += `⏸️ ${pending.length} document(s) pending\n`;
    }

    if (unprocessed > 0) {
      message += `📄 ${unprocessed} document(s) not yet started\n`;
    }

    if (failed.length > 0) {
      message += `❌ ${failed.length} document(s) failed\n`;
    }

    if (completed.length > 0) {
      message += "\n💬 You can ask questions about the completed documents!";
    } else if (processing.length > 0) {
      message += "\n⏳ Processing in progress. I'll notify you when ready!";
    } else {
      message += '\n💡 Type "process documents" to get started!';
    }

    return {
      type: "status",
      message,
      data: {
        total: totalDocs,
        completed: completed.length,
        processing: processing.length,
        pending: pending.length,
        unprocessed,
        failed: failed.length,
      },
    };
  } catch (error) {
    console.error("Error in handleStatusCommand:", error);
    return {
      type: "error",
      message: "Sorry, I couldn't retrieve the processing status. Please try again.",
    };
  }
}

/**
 * Handle "help" command
 */
function handleHelpCommand(): CommandResponse {
  const message = `🤖 Here's what I can do:

📄 Document Processing:
• "process documents" - Process all unprocessed documents
• "status" - Check processing progress

💬 Ask Questions:
• Just type your question naturally!
• Example: "What are the pet policies?"
• Example: "Tell me about maintenance fees"

📋 Information:
• "list documents" - Show all processed documents
• "help" - Show this message

✨ I analyze your property documents and provide accurate, fact-based answers with citations to the source documents.`;

  return {
    type: "help",
    message,
  };
}

/**
 * Handle "list documents" command
 */
async function handleListDocumentsCommand(
  propertyId: string,
  supabase: any
): Promise<CommandResponse> {
  try {
    // Get all documents with their processing status
    const { data: documents } = await supabase
      .from("property_documents")
      .select("id, document_type, document_label, uploaded_at")
      .eq("property_id", propertyId)
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false });

    if (!documents || documents.length === 0) {
      return {
        type: "info",
        message: "No documents found for this property.",
      };
    }

    // Get processing statuses
    const { data: statuses } = await supabase
      .from("property_document_processing_status")
      .select("document_id, status, total_chunks")
      .eq("property_id", propertyId);

    const statusMap = new Map(
      statuses?.map((s: any) => [s.document_id, s]) || []
    );

    let message = `📄 Documents for this property:\n\n`;

    documents.forEach((doc: any) => {
      const status = statusMap.get(doc.id);
      let statusIcon = "⏸️";
      let statusText = "Not processed";

      if (status) {
        if (status.status === "completed") {
          statusIcon = "✅";
          statusText = `Processed (${status.total_chunks} chunks)`;
        } else if (status.status === "processing") {
          statusIcon = "⏳";
          statusText = "Processing...";
        } else if (status.status === "failed") {
          statusIcon = "❌";
          statusText = "Failed";
        } else if (status.status === "pending") {
          statusIcon = "⏸️";
          statusText = "Pending";
        }
      }

      message += `${statusIcon} ${doc.document_label}\n   ${statusText}\n\n`;
    });

    const processedCount = Array.from(statusMap.values()).filter(
      (s: any) => s.status === "completed"
    ).length;

    if (processedCount > 0) {
      message += `\n💬 You can ask questions about the ${processedCount} processed document(s)!`;
    } else {
      message += '\n💡 Type "process documents" to analyze them!';
    }

    return {
      type: "list",
      message,
      data: { documents, statuses: Array.from(statusMap.values()) },
    };
  } catch (error) {
    console.error("Error in handleListDocumentsCommand:", error);
    return {
      type: "error",
      message: "Sorry, I couldn't retrieve the document list. Please try again.",
    };
  }
}

