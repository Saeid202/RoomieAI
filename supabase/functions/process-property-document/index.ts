// =====================================================
// Process Property Document - Edge Function
// =====================================================
// Purpose: Extract text from uploaded PDFs and generate
//          vector embeddings for RAG-based AI assistant
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Document category mapping
const DOCUMENT_CATEGORY_MAP: Record<string, string> = {
  title_deed: "Legal Identity",
  property_tax_bill: "Legal Identity",
  disclosures: "Property Condition",
  building_inspection: "Property Condition",
  condo_bylaws: "Governance",
  status_certificate: "Governance",
  survey_plan: "Governance",
  reserve_fund_study: "Governance",
  hoa_documents: "Governance",
};

interface ProcessDocumentRequest {
  documentId: string;
  propertyId: string;
  documentUrl: string;
  documentType: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { documentId, propertyId, documentUrl, documentType }: ProcessDocumentRequest = 
      await req.json();

    console.log("📄 Processing document:", { documentId, propertyId, documentType });

    // Create or update processing status
    await supabase
      .from("property_document_processing_status")
      .upsert({
        document_id: documentId,
        property_id: propertyId,
        status: "processing",
        started_at: new Date().toISOString(),
      });

    // Step 1: Download document from storage
    console.log("⬇️ Downloading document from:", documentUrl);
    const fileResponse = await fetch(documentUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download document: ${fileResponse.statusText}`);
    }
    const fileBlob = await fileResponse.blob();
    const fileBuffer = await fileBlob.arrayBuffer();

    // Step 2: Extract text from PDF
    console.log("📖 Extracting text from PDF...");
    const extractedText = await extractTextFromPDF(fileBuffer);
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text could be extracted from the document");
    }

    console.log(`✅ Extracted ${extractedText.length} characters`);

    // Step 3: Split text into chunks
    console.log("✂️ Splitting text into chunks...");
    const chunks = splitTextIntoChunks(extractedText, 1000, 200); // 1000 chars, 200 overlap
    console.log(`✅ Created ${chunks.length} chunks`);

    // Step 4: Generate embeddings for each chunk
    console.log("🧠 Generating embeddings...");
    const documentCategory = DOCUMENT_CATEGORY_MAP[documentType] || "Property Condition";
    
    let processedChunks = 0;
    const batchSize = 10; // Process 10 chunks at a time

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        const embedding = await generateEmbedding(chunk, openaiApiKey);
        
        return {
          property_id: propertyId,
          document_id: documentId,
          document_type: documentType,
          document_category: documentCategory,
          content: chunk,
          chunk_index: chunkIndex,
          embedding: JSON.stringify(embedding),
        };
      });

      const embeddingData = await Promise.all(embeddingPromises);

      // Insert batch into database
      const { error: insertError } = await supabase
        .from("property_document_embeddings")
        .insert(embeddingData);

      if (insertError) {
        console.error("❌ Error inserting embeddings:", insertError);
        throw insertError;
      }

      processedChunks += batch.length;
      console.log(`✅ Processed ${processedChunks}/${chunks.length} chunks`);

      // Update progress
      await supabase
        .from("property_document_processing_status")
        .update({
          total_chunks: chunks.length,
          processed_chunks: processedChunks,
        })
        .eq("document_id", documentId);
    }

    // Step 5: Mark as completed
    await supabase
      .from("property_document_processing_status")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_chunks: chunks.length,
        processed_chunks: chunks.length,
      })
      .eq("document_id", documentId);

    console.log("✅ Document processing completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksProcessed: chunks.length,
        category: documentCategory,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error processing document:", error);

    // Update status to failed
    try {
      const { documentId } = await req.json();
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from("property_document_processing_status")
        .update({
          status: "failed",
          error_message: error.message,
          retry_count: supabase.raw("retry_count + 1"),
        })
        .eq("document_id", documentId);
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
 * Extract text from PDF buffer
 * Note: This is a simplified version. In production, use a proper PDF parsing library
 */
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // For now, we'll use a simple approach
  // In production, you'd want to use pdf-parse or similar
  // This is a placeholder that assumes text-based PDFs
  
  try {
    // Convert buffer to text (this works for simple text PDFs)
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);
    
    // Basic cleanup
    const cleaned = text
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "") // Remove control characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
    
    return cleaned;
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Split text into overlapping chunks
 */
function splitTextIntoChunks(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    
    // Only add non-empty chunks
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
    
    // Move start position with overlap
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
