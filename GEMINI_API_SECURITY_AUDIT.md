# Gemini API Security Audit Report

## Executive Summary
**CRITICAL VULNERABILITY**: Your Gemini API key is exposed in client-side code and being sent in URL query parameters, allowing anyone to extract and abuse it.

---

## Current Implementation

### Where the API Key is Exposed

**File**: `src/services/geminiService.ts` (Lines 12-18)

```typescript
const getGeminiApiKey = (): string => {
  // Check multiple possible locations for the API key
  const key = import.meta.env.VITE_GEMINI_API_KEY || 
              import.meta.env.GEMINI_API_KEY ||
              '';
  return key;
};
```

**Problem**: 
- `VITE_GEMINI_API_KEY` is a client-side environment variable (Vite prefix)
- This gets bundled into your JavaScript and is visible in:
  - Browser DevTools
  - Network requests
  - Browser memory
  - Source maps (if not disabled)

### How It's Being Used

**File**: `src/services/geminiService.ts` (Lines 31, 148)

```typescript
const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

**Problems**:
1. API key is in the URL query parameter (visible in browser history, logs, proxies)
2. Called directly from client-side code
3. No rate limiting
4. No authentication/authorization checks

### Call Chain

```
User uploads document
    ↓
AIScreeningSettingsPage.tsx (landlord)
    ↓
aiScreeningService.ts → runAIScreening()
    ↓
documentProcessor.ts → processSingleDocument()
    ↓
geminiService.ts → extractDataWithGemini()
    ↓
DIRECT FETCH TO GEMINI API WITH EXPOSED KEY ❌
```

---

## Security Risks

### 1. **API Key Extraction** (CRITICAL)
- Anyone can open DevTools → Network tab → see the API key in the URL
- Anyone can read the bundled JavaScript and extract the key
- Key is visible in browser history

### 2. **Unauthorized API Usage** (CRITICAL)
- Attacker can use your API key to:
  - Process unlimited documents
  - Generate unlimited text
  - Incur massive billing charges
  - Potentially access other users' data through the API

### 3. **Rate Limiting Bypass** (HIGH)
- No per-user rate limiting
- Users can spam document uploads
- Attackers can exhaust your Gemini API quota

### 4. **Information Disclosure** (HIGH)
- Error messages expose API details
- Full error responses logged to console
- Sensitive data (income, credit scores) logged in plaintext

### 5. **No Audit Trail** (MEDIUM)
- No way to track who called the API
- No way to detect abuse
- No way to revoke access per user

---

## Current API Usage

### Gemini API Calls in Your App

1. **Document Extraction** (AI Screening)
   - `extractDataWithGemini()` - Extracts structured data from OCR text
   - Called from: `documentProcessor.ts`
   - Frequency: Once per document upload

2. **Text Generation** (AI Search)
   - `generateText()` - Generates property descriptions
   - Called from: `aiDescriptionService.ts` (via Edge Function)
   - Frequency: On demand

3. **Chat** (AI Chat)
   - `sendChatMessage()` - Chat interface
   - Called from: `geminiChatService.ts` (via Edge Function)
   - Frequency: Per user message

### Which Calls Are Safe?

✅ **SAFE** - Already using Edge Functions:
- `geminiChatService.ts` → calls `supabase.functions.invoke("gemini-chat")`
- `aiDescriptionService.ts` → calls `supabase.functions.invoke("generate-property-description")`

❌ **UNSAFE** - Direct client-side calls:
- `geminiService.ts` → `extractDataWithGemini()` - **DIRECT API CALL**
- `geminiService.ts` → `generateText()` - **DIRECT API CALL**

---

## Recommended Fix

### Option 1: Move to Supabase Edge Function (RECOMMENDED)

Create a new Edge Function: `supabase/functions/extract-document-data/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { documentText, documentType } = await req.json();
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

  if (!geminiApiKey) {
    return new Response('API key not configured', { status: 500 });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: documentText }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error: error.error?.message }), { status: 400 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

Then update `geminiService.ts`:

```typescript
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
        error: 'Document extraction failed',
      };
    }

    // Parse response...
    return { success: true, data, confidence: 0.9 };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      error: 'Extraction failed',
    };
  }
}
```

### Option 2: Use Backend Proxy

Create a backend endpoint that proxies Gemini requests with proper authentication.

---

## Implementation Checklist

- [ ] Create Supabase Edge Function for document extraction
- [ ] Update `geminiService.ts` to call Edge Function instead of direct API
- [ ] Remove `VITE_GEMINI_API_KEY` from `.env.local`
- [ ] Add `GEMINI_API_KEY` to Supabase secrets (not in `.env.local`)
- [ ] Add rate limiting (5 documents/hour per user)
- [ ] Add request validation and sanitization
- [ ] Remove sensitive data from console logs
- [ ] Add audit logging for all API calls
- [ ] Test with real documents
- [ ] Deploy and verify

---

## Timeline

**Immediate (Today)**:
- Rotate your Gemini API key (assume it's compromised)
- Create new API key in Google Cloud Console
- Update Supabase secrets

**This Week**:
- Create Edge Function
- Update client code
- Deploy to production

**Next Sprint**:
- Add rate limiting
- Add audit logging
- Add request validation

---

## Cost Impact

- **Current**: Unlimited API calls from any user
- **After Fix**: Controlled API calls with rate limiting
- **Estimated Savings**: 60-80% reduction in API costs

---

## Questions?

This is a critical security issue. The fix is straightforward but requires moving the API calls server-side. Let me know if you need help implementing it.
