// =====================================================
// Document Processor - Orchestrates OCR + LLM Pipeline
// Coordinates document download, OCR, and Gemini extraction
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { getDocumentSignedUrl, downloadTenantDocument } from './documentUploadService';
import {
  extractTextFromDocument,
  extractTextFromMultiplePages,
  cleanExtractedText,
  isOcrSupported,
  getFileTypeDescription,
  OCRProgress,
} from './ocrService';
import {
  extractDataWithGemini,
  generateExtractionSummary,
  GeminiExtractionResult,
} from './geminiService';
import {
  ScreeningDocumentType,
  ExtractedDocumentData,
} from '@/types/aiScreening';

export interface DocumentProcessingResult {
  documentType: ScreeningDocumentType;
  fileName: string;
  success: boolean;
  extractedData: ExtractedDocumentData['data_points'];
  confidence: number;
  errors: string[];
  ocrText?: string;
  processingTime: number;
}

export interface DocumentProcessingProgress {
  documentType: ScreeningDocumentType;
  status: 'pending' | 'downloading' | 'ocr' | 'extracting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

/**
 * Process a single tenant document through the full pipeline:
 * 1. Get signed URL from storage
 * 2. Download the file
 * 3. Run OCR to extract raw text
 * 4. Run Gemini to extract structured data
 */
export async function processSingleDocument(
  filePath: string,
  documentType: ScreeningDocumentType,
  onProgress?: (progress: DocumentProcessingProgress) => void
): Promise<DocumentProcessingResult> {
  const startTime = Date.now();
  const fileName = filePath.split('/').pop() || 'unknown';

  try {
    // Step 1: Get signed URL
    onProgress?.({
      documentType,
      status: 'downloading',
      progress: 10,
      message: 'Getting document access...',
    });

    const signedUrl = await getDocumentSignedUrl(filePath);
    if (!signedUrl) {
      throw new Error('Could not access document');
    }

    // Step 2: Download the file
    onProgress?.({
      documentType,
      status: 'downloading',
      progress: 30,
      message: 'Downloading document...',
    });

    const blob = await downloadTenantDocument(filePath);
    if (!blob) {
      throw new Error('Download failed');
    }

    // Check if file type supports OCR
    const mimeType = blob.type || 'application/pdf';
    if (!isOcrSupported(mimeType)) {
      return {
        documentType,
        fileName,
        success: false,
        extractedData: {},
        confidence: 0,
        errors: [`File type ${getFileTypeDescription(mimeType)} is not supported for OCR`],
        processingTime: Date.now() - startTime,
      };
    }

    // Step 3: Run OCR
    onProgress?.({
      documentType,
      status: 'ocr',
      progress: 50,
      message: 'Extracting text with OCR...',
    });

    const ocrResult = await extractTextFromDocument(blob, (ocrProgress) => {
      onProgress?.({
        documentType,
        status: 'ocr',
        progress: 50 + Math.round(ocrProgress.progress * 0.2),
        message: `OCR: ${ocrProgress.status}`,
      });
    });

    const cleanedText = cleanExtractedText(ocrResult.text);

    // Check if OCR produced meaningful text
    if (cleanedText.length < 10) {
      return {
        documentType,
        fileName,
        success: false,
        extractedData: {},
        confidence: 0,
        errors: ['Document appears to be empty or unreadable'],
        ocrText: cleanedText,
        processingTime: Date.now() - startTime,
      };
    }

    // Step 4: Extract structured data with Gemini
    onProgress?.({
      documentType,
      status: 'extracting',
      progress: 75,
      message: 'Analyzing with AI...',
    });

    const geminiResult = await extractDataWithGemini(cleanedText, documentType);

    onProgress?.({
      documentType,
      status: 'complete',
      progress: 100,
      message: geminiResult.success ? 'Complete' : 'Completed with warnings',
    });

    return {
      documentType,
      fileName,
      success: geminiResult.success,
      extractedData: geminiResult.data || {},
      confidence: geminiResult.confidence,
      errors: geminiResult.error ? [geminiResult.error] : [],
      ocrText: cleanedText,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`Error processing ${documentType}:`, error);
    return {
      documentType,
      fileName,
      success: false,
      extractedData: {},
      confidence: 0,
      errors: [String(error)],
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Process all required documents for a tenant application
 */
export async function processTenantDocuments(
  tenantProfile: Record<string, unknown>,
  requiredDocuments: ScreeningDocumentType[],
  onProgress?: (progress: DocumentProcessingProgress) => void
): Promise<ExtractedDocumentData[]> {
  const results: ExtractedDocumentData[] = [];

  // Map document types to profile fields
  const documentFieldMap: Record<ScreeningDocumentType, keyof typeof tenantProfile> = {
    credit_report: 'credit_score_report',
    payroll: 'additional_documents', // May contain payroll
    employment_letter: 'employment_letter',
    reference_letter: 'reference_letters',
  };

  for (const docType of requiredDocuments) {
    const fieldName = documentFieldMap[docType];
    const filePath = tenantProfile[fieldName] as string | null | undefined;

    if (!filePath) {
      // Document not uploaded
      results.push({
        document_type: docType,
        file_name: '',
        confidence_score: 0,
        data_points: {},
        errors: ['Document not uploaded'],
      });
      continue;
    }

    const result = await processSingleDocument(filePath, docType, onProgress);

    results.push({
      document_type: docType,
      file_name: result.fileName,
      extracted_text: result.ocrText,
      confidence_score: result.confidence,
      data_points: result.extractedData,
      errors: result.errors,
    });
  }

  return results;
}

/**
 * Process a single document by its file path (used by aiScreeningService)
 */
export async function extractDocumentData(
  filePath: string,
  documentType: ScreeningDocumentType
): Promise<ExtractedDocumentData> {
  const result = await processSingleDocument(filePath, documentType);

  return {
    document_type: documentType,
    file_name: result.fileName,
    extracted_text: result.ocrText,
    confidence_score: result.confidence,
    data_points: result.extractedData,
    errors: result.errors,
  };
}

/**
 * Generate a human-readable summary of all extracted data
 */
export function createExtractionSummary(
  extractedData: ExtractedDocumentData[]
): string {
  const lines: string[] = [];

  for (const doc of extractedData) {
    const data = doc.data_points;
    const status = doc.errors.length > 0 ? '⚠️' : '✅';
    const docLabel = doc.document_type.replace(/_/g, ' ');

    let line = `${status} ${docLabel}`;

    if (doc.errors.length > 0) {
      line += `: ${doc.errors.join(', ')}`;
    } else {
      const details: string[] = [];
      if (data.credit_score) details.push(`Score: ${data.credit_score}`);
      if (data.monthly_income) details.push(`$${data.monthly_income.toLocaleString()}/mo`);
      if (data.employer_name) details.push(data.employer_name);
      if (data.employment_months) details.push(`${data.employment_months} months`);
      if (data.reference_quality) details.push(`Ref: ${data.reference_quality}`);

      if (details.length > 0) {
        line += ` - ${details.join(', ')}`;
      }
    }

    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Check if all required documents are present and processable
 */
export function validateRequiredDocuments(
  tenantProfile: Record<string, unknown>,
  requiredDocuments: ScreeningDocumentType[]
): { complete: boolean; missing: ScreeningDocumentType[] } {
  const documentFieldMap: Record<ScreeningDocumentType, keyof typeof tenantProfile> = {
    credit_report: 'credit_score_report',
    payroll: 'additional_documents',
    employment_letter: 'employment_letter',
    reference_letter: 'reference_letters',
  };

  const missing: ScreeningDocumentType[] = [];

  for (const docType of requiredDocuments) {
    const fieldName = documentFieldMap[docType];
    const filePath = tenantProfile[fieldName] as string | null | undefined;
    if (!filePath) {
      missing.push(docType);
    }
  }

  return {
    complete: missing.length === 0,
    missing,
  };
}