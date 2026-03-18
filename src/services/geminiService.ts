// =====================================================
// Gemini LLM Service - Structured Data Extraction
// Uses Gemini API to extract structured data from document text
// =====================================================

import { ScreeningDocumentType, ExtractedDocumentData } from '@/types/aiScreening';

// Gemini API endpoint (using Supabase Edge Functions or direct API)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Get API key from environment
const getGeminiApiKey = (): string => {
  // Check multiple possible locations for the API key
  const key = import.meta.env.VITE_GEMINI_API_KEY || 
              import.meta.env.GEMINI_API_KEY ||
              '';
  return key;
};

/**
 * Simple text generation with Gemini for general queries
 */
export async function generateText(prompt: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return generatedText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
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
 * System prompt for document extraction
 */
const EXTRACTION_SYSTEM_PROMPT = `You are an expert document analyzer for rental applications. Your task is to extract specific data points from tenant documents.

For each document type, extract the following:

1. CREDIT REPORT:
   - credit_score (number, 300-850)
   - Any notes about credit history

2. PAYROLL/INCOME DOCUMENTS:
   - monthly_income (number, in CAD)
   - employer_name (string)
   - pay_period (weekly, bi-weekly, monthly)

3. EMPLOYMENT LETTER:
   - employer_name (string)
   - job_title (string)
   - employment_months (number, calculate from start date if given)
   - employment_status (full-time, part-time, contract)

4. REFERENCE LETTER:
   - reference_quality (excellent, good, average, poor, unclear)
   - reference_contact (name and contact info if available)
   - relationship (landlord, employer, personal)

Return ONLY a valid JSON object with the extracted data. If a field cannot be determined, set it to null.
Example format:
{
  "credit_score": 720,
  "monthly_income": 5500,
  "employer_name": "Acme Corp",
  "job_title": "Software Developer",
  "employment_months": 24,
  "reference_quality": "good",
  "reference_contact": "John Smith - 555-1234"
}

If the document is unreadable or doesn't match the expected type, return:
{
  "error": "Document is unclear or doesn't match expected type"
}`;

/**
 * Extract structured data from document text using Gemini
 */
export async function extractDataWithGemini(
  documentText: string,
  documentType: ScreeningDocumentType
): Promise<GeminiExtractionResult> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return {
      success: false,
      confidence: 0,
      error: 'Gemini API key not configured',
    };
  }

  try {
    const documentTypeInstructions = getDocumentTypeInstructions(documentType);
    
    const prompt = `${EXTRACTION_SYSTEM_PROMPT}

${documentTypeInstructions}

DOCUMENT TEXT TO ANALYZE:
---
${documentText}
---

Respond with JSON only:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt,
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return {
        success: false,
        confidence: 0,
        error: `Gemini API error: ${errorData.error?.message || 'Unknown error'}`,
      };
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    const cleanedText = generatedText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedText);

    // Check for error in response
    if (parsedData.error) {
      return {
        success: false,
        confidence: 0.3,
        error: parsedData.error,
        rawResponse: generatedText,
      };
    }

    // Calculate confidence based on how many fields were successfully extracted
    const expectedFields = getExpectedFields(documentType);
    const extractedFields = Object.keys(parsedData).filter(
      (key) => parsedData[key] !== null && parsedData[key] !== undefined
    );
    const confidence = extractedFields.length / expectedFields.length;

    return {
      success: true,
      data: parsedData,
      confidence: Math.min(confidence, 1),
      rawResponse: generatedText,
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
 * Get document-type specific instructions
 */
function getDocumentTypeInstructions(documentType: ScreeningDocumentType): string {
  const instructions: Record<ScreeningDocumentType, string> = {
    credit_report: `This is a CREDIT REPORT document. Look for:
- Credit score (usually prominently displayed as "Score" or "Rating")
- Any credit utilization percentages
- Collection accounts or bankruptcies
- Payment history summary`,

    payroll: `This is a PAYROLL/INCOME document. Look for:
- Gross monthly income (before taxes)
- Employer name and address
- Pay frequency (weekly, bi-weekly, monthly)
- Year-to-date earnings`,

    employment_letter: `This is an EMPLOYMENT VERIFICATION LETTER. Look for:
- Employee name
- Job title/position
- Start date (calculate months of employment)
- Employment status (full-time, part-time, permanent)
- Salary information if provided`,

    reference_letter: `This is a REFERENCE LETTER. Look for:
- Reference writer name and contact info
- Relationship to applicant (landlord, employer, personal)
- Length of relationship
- Quality indicators (positive language, specific details)
- Overall recommendation strength`,
  };

  return instructions[documentType] || 'Analyze this document for relevant information.';
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