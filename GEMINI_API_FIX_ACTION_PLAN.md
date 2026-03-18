# Gemini API Security Fix - Action Plan

## IMMEDIATE ACTIONS (Do Now)

### 1. Rotate Your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Find your Gemini API key
3. Delete the current key
4. Create a new API key
5. Update Supabase secrets with the new key

**Why**: Your current key is exposed in client-side code and may be compromised

### 2. Check Your .env.local
```bash
# REMOVE THIS LINE:
VITE_GEMINI_API_KEY=your_key_here

# KEEP THIS (for Supabase):
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Why**: `VITE_` prefix means it gets bundled into your JavaScript

---

## WHAT'S CURRENTLY EXPOSED

### Files with Direct Gemini API Calls
1. `src/services/geminiService.ts` - **UNSAFE**
   - `extractDataWithGemini()` - Called from document processor
   - `generateText()` - Called from AI search

2. `src/services/documentProcessor.ts` - **UNSAFE**
   - Calls `extractDataWithGemini()` directly from client

### Files Already Safe (Using Edge Functions)
1. `src/services/geminiChatService.ts` - ✅ SAFE
   - Calls `supabase.functions.invoke("gemini-chat")`

2. `src/services/aiDescriptionService.ts` - ✅ SAFE
   - Calls `supabase.functions.invoke("generate-property-description")`

---

## STEP-BY-STEP FIX

### Step 1: Create Supabase Edge Function

Create file: `supabase/functions/extract-document-data/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const EXTRACTION_SYSTEM_PROMPT = `You are an expert document analyzer for rental applications...`;

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

    // Get API key from Supabase secrets (NOT from client)
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured");
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 500 });
    }

    // Build prompt
    const prompt = `${EXTRACTION_SYSTEM_PROMPT}\n\nDocument text:\n${documentText}`;

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
```

### Step 2: Update geminiService.ts

Replace the `extractDataWithGemini` function:

```typescript
export async function extractDataWithGemini(
  documentText: string,
  documentType: ScreeningDocumentType
): Promise<GeminiExtractionResult> {
  try {
    // Call Edge Function instead of direct API
    const { data, error } = await supabase.functions.invoke('extract-document-data', {
      body: { documentText, documentType },
    });

    if (error) {
      return {
        success: false,
        confidence: 0,
        error: 'Document extraction failed',
      };
    }

    // Check for error in response
    if (data.error) {
      return {
        success: false,
        confidence: 0.3,
        error: data.error,
      };
    }

    // Calculate confidence
    const expectedFields = getExpectedFields(documentType);
    const extractedFields = Object.keys(data).filter(
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
      error: `Extraction failed`,
    };
  }
}
```

### Step 3: Remove Client-Side API Key

In `.env.local`, remove:
```
VITE_GEMINI_API_KEY=...
```

### Step 4: Add API Key to Supabase

1. Go to Supabase Dashboard
2. Project Settings → Secrets
3. Add new secret: `GEMINI_API_KEY` = your_new_key

### Step 5: Deploy

```bash
# Deploy Edge Function
supabase functions deploy extract-document-data

# Or push to production
git add -A
git commit -m "fix: move Gemini API calls to Edge Function for security"
git push
```

---

## VERIFICATION

After deployment, test:

1. **Check DevTools** - No API key visible in Network tab
2. **Check Source** - No API key in bundled JavaScript
3. **Test Document Upload** - Should still work
4. **Check Supabase Logs** - Should see function invocations

---

## ADDITIONAL SECURITY MEASURES

### Add Rate Limiting

In the Edge Function, add:

```typescript
// Rate limiting: 5 documents per hour per user
const userId = req.headers.get('x-user-id');
const key = `extract-${userId}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 3600);
if (count > 5) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
}
```

### Add Audit Logging

```typescript
// Log all API calls
await supabase
  .from('api_audit_logs')
  .insert({
    user_id: userId,
    function: 'extract-document-data',
    document_type: documentType,
    status: 'success',
    timestamp: new Date().toISOString(),
  });
```

### Remove Sensitive Data from Logs

In `geminiService.ts`, remove all `console.log` statements with sensitive data:

```typescript
// ❌ BAD - Don't log sensitive data
console.log('Extracted data:', parsedData);

// ✅ GOOD - Log only status
console.log('Document extraction completed');
```

---

## TIMELINE

- **Today**: Rotate API key, remove from .env.local
- **Tomorrow**: Create Edge Function, test locally
- **This Week**: Deploy to production
- **Next Sprint**: Add rate limiting and audit logging

---

## COST IMPACT

- **Before**: Unlimited API calls, potential abuse
- **After**: Controlled, rate-limited API calls
- **Estimated Savings**: 60-80% reduction in API costs

---

## Questions?

This is critical. Let me know if you need help with any step.
