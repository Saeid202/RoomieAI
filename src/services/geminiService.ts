// =====================================================
// Gemini LLM Service - Structured Data Extraction
// Uses Supabase Edge Functions to call Gemini API securely
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { ScreeningDocumentType, ExtractedDocumentData } from '@/types/aiScreening';

/**
 * Simple text generation with Gemini via Edge Function
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { prompt },
    });

    if (error) {
      throw new Error(error.message || 'Gemini API error');
    }

    return data.text || '';
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

export interface GeminiExtractionResult {
  success: boolean;
  data?: ExtractedDocumentData['data_points'];
  confidence: number;
  error?: string;
  rawResponse?: string;
}

/**
 * Extract structured data from document text using Gemini via Edge Function
 */
export async function extractDataWithGemini(
  documentText: string,
  documentType: ScreeningDocumentType
): Promise<GeminiExtractionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-document-data', {
      body: { documentText, documentType },
    });

    if (error) {
      return {
        success: false,
        confidence: 0,
        error: error.message || 'Document extraction failed',
      };
    }

    // Check for error in response
    if (data?.error) {
      return {
        success: false,
        confidence: 0.3,
        error: data.error,
      };
    }

    // Calculate confidence based on how many fields were successfully extracted
    const expectedFields = getExpectedFields(documentType);
    const extractedFields = Object.keys(data || {}).filter(
      (key) => data[key] !== null && data[key] !== undefined
    );
    const confidence = extractedFields.length / expectedFields.length;

    return {
      success: true,
      data: data,
      confidence: Math.min(confidence, 1),
    };
  } catch (error) {
    console.error('Gemini extraction error:', error);
    return {
      success: false,
      confidence: 0,
      error: `Extraction failed: ${error}`,
    };
  }
}

/**
 * Get expected number of fields for a document type
 */
function getExpectedFields(documentType: ScreeningDocumentType): number {
  const fieldCounts: Record<ScreeningDocumentType, number> = {
    credit_report: 2,
    payroll: 3,
    employment_letter: 4,
    reference_letter: 3,
  };
  return fieldCounts[documentType] || 3;
}

/**
 * Batch extract data from multiple documents
 */
export async function extractMultipleDocuments(
  documents: Array<{ type: ScreeningDocumentType; text: string }>
): Promise<Array<{ type: ScreeningDocumentType; result: GeminiExtractionResult }>> {
  const results = await Promise.all(
    documents.map(async (doc) => {
      const result = await extractDataWithGemini(doc.text, doc.type);
      return { type: doc.type, result };
    })
  );
  return results;
}

/**
 * Generate a summary of extracted data for the landlord
 */
export function generateExtractionSummary(
  extractedData: ExtractedDocumentData[]
): string {
  const summaries: string[] = [];

  for (const doc of extractedData) {
    const data = doc.data_points;
    let summary = `${doc.document_type.replace(/_/g, ' ')}: `;

    const values: string[] = [];
    
    if (data.credit_score) values.push(`Score: ${data.credit_score}`);
    if (data.monthly_income) values.push(`Income: $${data.monthly_income.toLocaleString()}/month`);
    if (data.employer_name) values.push(`Employer: ${data.employer_name}`);
    if (data.job_title) values.push(`Role: ${data.job_title}`);
    if (data.employment_months) values.push(`${data.employment_months} months employment`);
    if (data.reference_quality) values.push(`Reference: ${data.reference_quality}`);

    summary += values.join(', ') || 'No data extracted';
    summaries.push(summary);
  }

  return summaries.join('\n');
}