// =====================================================
// Process Property Document - Gemini Version
// =====================================================
// Purpose: Extract text from PDFs and generate embeddings
// Uses: Gemini gemini-embedding-001 (3072 dimensions, truncated to 2000)
// Note: PDFs only - no image support yet
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  let currentDocumentId: string | null = null;

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const { documentId, propertyId, documentUrl, documentType }: ProcessDocumentRequest = 
      await req.json();

    currentDocumentId = documentId;
    console.log("📄 Processing document:", { documentId, propertyId, documentType });

    // Check if it's an image file - mark as failed
    if (documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      console.log("⚠️ Skipping image file - not supported yet");
      await supabase
        .from("property_document_processing_status")
        .upsert({
          document_id: documentId,
          property_id: propertyId,
          status: "failed",
          error_message: "Image files not supported - PDF processing only",
          updated_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Image files not supported yet",
          skipped: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create or update processing status
    await supabase
      .from("property_document_processing_status")
      .upsert({
        document_id: documentId,
        property_id: propertyId,
        status: "processing",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
    const chunks = splitTextIntoChunks(extractedText, 1000, 200);
    console.log(`✅ Created ${chunks.length} chunks`);

    // Step 4: Generate embeddings for each chunk
    console.log("🧠 Generating embeddings...");
    const documentCategory = DOCUMENT_CATEGORY_MAP[documentType] || "Property Condition";
    
    let processedChunks = 0;
    const batchSize = 5; // Process 5 chunks at a time

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        const embedding = await generateEmbedding(chunk, geminiApiKey);
        
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
          updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
    if (currentDocumentId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: currentStatus } = await supabase
          .from("property_document_processing_status")
          .select("retry_count")
          .eq("document_id", currentDocumentId)
          .single();

        const nextRetryCount = (currentStatus?.retry_count || 0) + 1;

        await supabase
          .from("property_document_processing_status")
          .update({
            status: "failed",
            error_message: (error as any).message || "Unknown error",
            retry_count: nextRetryCount,
            updated_at: new Date().toISOString(),
          })
          .eq("document_id", currentDocumentId);
      } catch (updateError) {
        console.error("Failed to update error status:", updateError);
      }
    }

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
 * Extract text from PDF using simple text extraction
 * Works for text-based PDFs only (not scanned images)
 */
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log("📄 Extracting text from PDF...");
    
    // Convert buffer to text
    const decoder = new TextDecoder("utf-8");
    let text = decoder.decode(buffer);
    
    // Try to extract text between stream markers (common in PDFs)
    const streamMatches = text.match(/stream\s+([\s\S]*?)\s+endstream/g);
    if (streamMatches && streamMatches.length > 0) {
      text = streamMatches
        .map(match => match.replace(/stream\s+/, '').replace(/\s+endstream/, ''))
        .join(' ');
    }
    
    // Clean up the text
    const cleaned = text
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      .replace(/\/[A-Z][a-z]+/g, " ")
      .replace(/<<|>>/g, " ")
      .replace(/\[|\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    // Validate we got meaningful text
    if (cleaned.length < 50) {
      throw new Error("Extracted text is too short - PDF may be scanned or image-based");
    }
    
    // Check if text contains mostly readable characters
    const readableChars = cleaned.match(/[a-zA-Z0-9\s.,;:!?()-]/g);
    if (!readableChars || readableChars.length < cleaned.length * 0.3) {
      throw new Error("Extracted text contains too many non-readable characters");
    }
    
    console.log(`✅ Extracted ${cleaned.length} characters of text`);
    return cleaned;
    
  } catch (error) {
    console.error("❌ Error extracting text:", error);
    throw new Error(`Failed to extract text from PDF: ${(error as any).message}`);
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
    
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
    
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generate embedding using Google Gemini API
 * Uses gemini-embedding-001 model (returns 3072 dimensions, truncated to 2000)
 * Note: pgvector HNSW index max is 2000 dimensions, so we use IVFFlat and truncate
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
  
  // Gemini returns 3072 dimensions, but pgvector HNSW max is 2000
  // Truncate to 2000 dimensions (keeps most important features)
  const truncatedEmbedding = fullEmbedding.slice(0, 2000);
  
  console.log(`📊 Embedding: ${fullEmbedding.length} dims → ${truncatedEmbedding.length} dims`);
  
  return truncatedEmbedding;
}
