// =====================================================
// AI Property Assistant Types
// =====================================================
// Purpose: Type definitions for RAG-based property Q&A
// =====================================================

/**
 * Document category for organization
 */
export type DocumentCategory = 'Legal Identity' | 'Property Condition' | 'Governance';

/**
 * Citation from source document
 */
export interface DocumentCitation {
  documentType: string;
  documentCategory: DocumentCategory;
  content: string;
  pageNumber?: number;
  sectionTitle?: string;
  similarity: number;
}

/**
 * AI conversation message
 */
export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: DocumentCitation[];
  timestamp: string;
  tokensUsed?: number;
  responseTime?: number;
}

/**
 * Conversation history from database
 */
export interface AIPropertyConversation {
  id: string;
  property_id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  citations: DocumentCitation[];
  response_time_ms?: number;
  tokens_used?: number;
  model_used: string;
  created_at: string;
}

/**
 * Document processing status
 */
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Document processing info
 */
export interface DocumentProcessingStatus {
  id: string;
  document_id: string;
  property_id: string;
  status: ProcessingStatus;
  total_chunks: number;
  processed_chunks: number;
  error_message?: string;
  retry_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * AI assistant request
 */
export interface AIAssistantRequest {
  propertyId: string;
  userId: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * AI assistant response
 */
export interface AIAssistantResponse {
  success: boolean;
  response?: string;
  citations?: DocumentCitation[];
  responseTime?: number;
  tokensUsed?: number;
  error?: string;
}

/**
 * Document processing request
 */
export interface ProcessDocumentRequest {
  documentId: string;
  propertyId: string;
  documentUrl: string;
  documentType: string;
}

/**
 * Document processing response
 */
export interface ProcessDocumentResponse {
  success: boolean;
  documentId?: string;
  chunksProcessed?: number;
  category?: string;
  error?: string;
}

/**
 * Property AI readiness status
 */
export interface PropertyAIReadiness {
  isReady: boolean;
  totalDocuments: number;
  processedDocuments: number;
  pendingDocuments: number;
  failedDocuments: number;
  processingDocuments: number;
}
