// =====================================================
// Process Property Document - Edge Function
// =====================================================
// Purpose: Extract text from uploaded PDFs and generate
//          vector embeddings for RAG-based AI assistant
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { logger } from "../_shared/logger.ts";

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
  logger.info('Incoming request', { method: req.method, path: new URL(req.url).pathname });

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    logger.debug('Handling CORS preflight');
    return new Response("ok", { headers: corsHeaders });
  }

  let currentDocumentId: string | null = null;
  const STORAGE_BUCKET = 'property-documents';

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      logger.error('GEMINI_API_KEY is not configured');
      throw new Error("GEMINI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user from JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create auth client to verify user
    const authClient = createClient(supabaseUrl, authHeader.replace("Bearer ", ""));
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse request
    const body = await req.json();
    const { documentId, propertyId, documentUrl, documentType }: ProcessDocumentRequest = body;
    currentDocumentId = documentId;

    if (!documentUrl) {
      throw new Error("Missing documentUrl in request");
    }

    // Check rate limit (5 docs per hour per user)
    const { data: rateLimit } = await supabase
      .rpc("check_document_rate_limit", { p_user_id: user.id });

    if (rateLimit && !rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { userId: user.id, count: rateLimit.count, limit: rateLimit.limit });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Maximum 5 documents per hour.",
          limit: rateLimit.limit,
          current: rateLimit.count
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    logger.info('Processing document', { documentId, propertyId, documentType, userId: user.id });

    // Create or update processing status
    await supabase
      .from("property_document_processing_status")
      .upsert({
        document_id: documentId,
        property_id: propertyId,
        status: "processing",
        started_at: new Date().toISOString(),
        error_message: null,
      });

    // Record this request for rate limiting
    await supabase
      .rpc("record_document_request", {
        p_user_id: user.id,
        p_document_id: documentId,
        p_property_id: propertyId,
        p_ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null
      });

    // Step 1: Download document from storage
    const filePath = extractPathFromUrl(documentUrl, STORAGE_BUCKET);
    logger.debug('Downloading document', { bucket: STORAGE_BUCKET, path: filePath });

    let fileBuffer: ArrayBuffer;

    const { data: storageBlob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (downloadError) {
      logger.warn('Storage download failed, attempting direct fetch fallback', { error: downloadError.message });

      const fileResponse = await fetch(documentUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download document: ${fileResponse.statusText} Status: ${fileResponse.status}. URL: ${documentUrl}`);
      }
      const fetchBlob = await fileResponse.blob();
      fileBuffer = await fetchBlob.arrayBuffer();
    } else {
      logger.debug('Storage download successful');
      fileBuffer = await storageBlob.arrayBuffer();
    }

    const chunkCount = await processFile(fileBuffer);

    async function processFile(fileBuffer: ArrayBuffer): Promise<number> {
      // Step 2: Extract text from document (PDF or Image)
      logger.debug('Extracting text from document');
      const extractedText = await extractTextFromPDF(fileBuffer, documentUrl, geminiApiKey);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the document");
      }

      logger.info('Text extraction complete', { charCount: extractedText.length });

      // Step 3: Split text into chunks
      logger.debug('Splitting text into chunks');
      const chunks = splitTextIntoChunks(extractedText, 1000, 200);
      logger.info('Chunks created', { chunkCount: chunks.length });

      // Step 4: Generate embeddings for each chunk
      logger.debug('Generating embeddings');
      const documentCategory = DOCUMENT_CATEGORY_MAP[documentType] || "Property Condition";

      let processedChunks = 0;
      const batchSize = 10; // Process 10 chunks at a time

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        // Generate embeddings for batch
        const embeddingPromises = batch.map(async (chunk, batchIndex) => {
          const chunkIndex = i + batchIndex;
          try {
            const embedding = await generateEmbedding(chunk, geminiApiKey);

            return {
              property_id: propertyId,
              document_id: documentId,
              document_type: documentType,
              document_category: documentCategory,
              content: chunk,
              chunk_index: chunkIndex,
              embedding: JSON.stringify(embedding), // Explicitly stringify for pgvector
            };
          } catch (e) {
            logger.error('Failed to generate embedding for chunk', { chunkIndex });
            throw e;
          }
        });

        const embeddingData = await Promise.all(embeddingPromises);

        // Insert batch into database
        const { error: insertError } = await supabase
          .from("property_document_embeddings")
          .insert(embeddingData);

        if (insertError) {
          logger.error('Error inserting embeddings batch', { error: insertError.message });
          throw insertError;
        }

        processedChunks += batch.length;
        logger.debug('Chunks processed', { processed: processedChunks, total: chunks.length });

        // Update progress
        await supabase
          .from("property_document_processing_status")
          .update({
            total_chunks: chunks.length,
            processed_chunks: processedChunks,
            status: "processing",
          })
          .eq("document_id", documentId);
      }
      return chunks.length;
    }

    // Step 5: Mark as completed
    await supabase
      .from("property_document_processing_status")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_chunks: chunkCount,
        processed_chunks: chunkCount,
      })
      .eq("document_id", documentId);

    logger.info('Document processing completed', { documentId, chunksTotal: chunkCount });

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksTotal: chunkCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    logger.error('Error processing document', { message: (error as any).message });

    // Update status to failed
    if (currentDocumentId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get current retry count
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
        logger.error('Failed to update error status in DB', { message: (updateError as any).message });
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
 * Extract text from document (PDF or Image)
 * Uses Gemini Vision API for images and PDFs
 */
async function extractTextFromPDF(buffer: ArrayBuffer, documentUrl: string, geminiApiKey: string): Promise<string> {
  try {
    // Check file type from URL
    const isImage = documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPDF = documentUrl.match(/\.pdf$/i);

    if (isImage || isPDF) {
      // Use Gemini Vision API for both images and PDFs
      logger.debug('Using Gemini Vision API', { type: isImage ? 'image' : 'pdf' });

      // Convert buffer to base64
      const base64Data = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Determine MIME type
      let mimeType = 'application/pdf';
      if (documentUrl.match(/\.jpg|\.jpeg$/i)) mimeType = 'image/jpeg';
      else if (documentUrl.match(/\.png$/i)) mimeType = 'image/png';
      else if (documentUrl.match(/\.gif$/i)) mimeType = 'image/gif';
      else if (documentUrl.match(/\.webp$/i)) mimeType = 'image/webp';

      // Call Gemini Vision API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "Extract all text from this document. Include all visible text, numbers, labels, and content. Preserve the structure and formatting as much as possible. If this is a property document (deed, tax bill, inspection report, etc.), extract all relevant information."
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }]
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini Vision API error: ${error}`);
      }

      const data = await response.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the document");
      }

      return extractedText.trim();
    }

    // Fallback: Try simple text extraction for text-based PDFs
    logger.debug('Attempting simple text extraction');
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(buffer);

    const cleaned = text
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length > 100) {
      return cleaned;
    }

    throw new Error("Could not extract text from document");

  } catch (error) {
    logger.error('Error extracting text from document', { message: (error as any).message });
    throw error;
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

/**
 * Extract storage path from a Supabase Storage URL
 */
function extractPathFromUrl(url: string, bucketName: string): string {
  try {
    // Standard Supabase public/authenticated URL format
    // https://.../storage/v1/object/[public|authenticated]/bucketName/path/to/file.pdf
    const searchString = `/object/public/${bucketName}/`;
    const authSearchString = `/object/authenticated/${bucketName}/`;

    let path = "";
    if (url.includes(searchString)) {
      path = url.split(searchString)[1];
    } else if (url.includes(authSearchString)) {
      path = url.split(authSearchString)[1];
    } else {
      // Fallback: try to find the bucket name and take everything after it
      const bucketSearch = `/${bucketName}/`;
      if (url.includes(bucketSearch)) {
        path = url.split(bucketSearch)[1];
      } else {
        path = url; // Last resort
      }
    }

    // Remove any query parameters
    return path.split('?')[0];
  } catch (error) {
    logger.error('Error extracting path from URL', { message: (error as any).message });
    return url;
  }
}
