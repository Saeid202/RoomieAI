# Gemini API Usage Summary

## Good News! 🎉

The `generateText()` function is **NOT currently used** in your application.

---

## Current Gemini API Usage

### ✅ SAFE - Using Edge Functions (Correct Approach)

1. **Chat Feature** - `geminiChatService.ts`
   - Calls: `supabase.functions.invoke("gemini-chat")`
   - Location: AI Chat page
   - Status: ✅ SECURE (API key on server)

2. **Property Description Generation** - `aiDescriptionService.ts`
   - Calls: `supabase.functions.invoke("generate-property-description")`
   - Location: Property listing creation
   - Status: ✅ SECURE (API key on server)

### ❌ UNSAFE - Direct Client-Side Calls

1. **Document Extraction** - `geminiService.ts`
   - Function: `extractDataWithGemini()`
   - Location: AI Screening feature (document upload)
   - Status: ❌ EXPOSED (API key in client code)
   - **Needs Fix**: Move to Edge Function

2. **Text Generation** - `geminiService.ts`
   - Function: `generateText()`
   - Location: **NOT USED ANYWHERE**
   - Status: ⚠️ EXPOSED but UNUSED
   - **Action**: Can be removed or moved to Edge Function

---

## What About RentalOptions AI Search?

You mentioned adding "Natural language queries" to RentalOptions. Let me check if that was implemented:

**Status**: The feature was designed but **NOT implemented** in the code.

The RentalOptions page does NOT have:
- AI search input field
- Natural language query parsing
- Gemini API calls

---

## Recommendation

### Priority 1: Fix Document Extraction (CRITICAL)
- Move `extractDataWithGemini()` to Edge Function
- This is actively used in AI Screening
- **Timeline**: This week

### Priority 2: Remove or Move generateText() (LOW)
- Currently unused
- Can be removed entirely OR moved to Edge Function for future use
- **Timeline**: Next sprint

### Priority 3: Implement AI Search in RentalOptions (OPTIONAL)
- If you want to add natural language search
- Use Edge Function approach (not direct API)
- **Timeline**: Future feature

---

## Files to Update

### Must Fix
- `src/services/geminiService.ts` - Move `extractDataWithGemini()` to Edge Function
- `src/services/documentProcessor.ts` - Update to call Edge Function

### Can Remove or Keep
- `src/services/geminiService.ts` - `generateText()` function (unused)

### Already Safe
- `src/services/geminiChatService.ts` - No changes needed
- `src/services/aiDescriptionService.ts` - No changes needed

---

## Summary

| Feature | Status | API Key Exposed | Action |
|---------|--------|-----------------|--------|
| Chat | ✅ Safe | No | None |
| Property Descriptions | ✅ Safe | No | None |
| Document Extraction | ❌ Unsafe | Yes | Move to Edge Function |
| Text Generation | ⚠️ Unused | Yes | Remove or move |
| AI Search (RentalOptions) | ❌ Not Implemented | N/A | Implement with Edge Function |

---

## Next Steps

1. **Rotate your Gemini API key** (assume it's compromised)
2. **Create Edge Function** for document extraction
3. **Update client code** to use Edge Function
4. **Remove or deprecate** `generateText()` function
5. **Deploy** and test

See `GEMINI_API_FIX_ACTION_PLAN.md` for detailed implementation steps.
