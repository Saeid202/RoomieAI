import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

function getDocumentTypeInstructions(documentType: string): string {
  const instructions: Record<string, string> = {
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

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { documentText, documentType } = await req.json();
    
    // Validate inputs
    if (!documentText || !documentType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate document text length
    if (documentText.length < 10) {
      return new Response(JSON.stringify({ error: 'Document text too short' }), { status: 400 });
    }

    // Get API key from Supabase secrets (NOT from client)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured");
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 500 });
    }

    // Build prompt
    const documentTypeInstructions = getDocumentTypeInstructions(documentType);
    const prompt = `${EXTRACTION_SYSTEM_PROMPT}

${documentTypeInstructions}

DOCUMENT TEXT TO ANALYZE:
---
${documentText}
---

Respond with JSON only:`;

    // Call Gemini API (API key stays on server)
    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const error = await response.json();
      console.error('Gemini API error:', error);
      return new Response(JSON.stringify({ error: 'Extraction failed' }), { status: 400 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse and return
    const cleanedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return new Response(JSON.stringify(parsedData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
});
