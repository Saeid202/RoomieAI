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
        p_query_embedding: JSON.stringify(queryEmbedding),
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
        model_used: "gemini-1.5-flash-latest",
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
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
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
 * Uses text-embedding-004 model (768 dimensions)
 */
async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/text-embedding-004",
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
  return data.embedding.values;
}
