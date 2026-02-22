# 🚀 Deploy AI Chat Edge Function

## Prerequisites

Before deploying, ensure:
- ✅ User has hard refreshed browser (Ctrl + Shift + R)
- ✅ UI shows "AI Ready" badge
- ✅ Chat button is visible
- ✅ No console errors in browser

## What Was Fixed

Updated `ai-property-assistant` Edge Function to:
1. ✅ Use `gemini-embedding-001` (same as document processing)
2. ✅ Truncate embeddings to 2000 dimensions (match database)
3. ✅ Pass embedding as array (not JSON string) to RPC function

## Deployment Command

```bash
supabase functions deploy ai-property-assistant
```

## Expected Output

```
Deploying function ai-property-assistant...
Function ai-property-assistant deployed successfully!
URL: https://[project-ref].supabase.co/functions/v1/ai-property-assistant
```

## Environment Variables

The function needs these environment variables (already set in Supabase Dashboard):
- ✅ `GEMINI_API_KEY`: `AIzaSyAKMwr5xp_B0YM5UfcUMVOewJkwMmQNDew`
- ✅ `SUPABASE_URL`: Auto-set by Supabase
- ✅ `SUPABASE_SERVICE_ROLE_KEY`: Auto-set by Supabase

## Test After Deployment

### Step 1: Open Chat Interface
1. Navigate to property details page
2. Click "AI Chat" button
3. Verify chat interface opens

### Step 2: Send Test Question
Type: **"What type of property is this?"**

Expected response:
- ✅ Response within 5 seconds
- ✅ Answer based on title deed content
- ✅ Citations shown at bottom
- ✅ Source document listed

### Step 3: Test Multiple Questions
Try these questions:
1. "Tell me about the property details"
2. "What information is in the title deed?"
3. "Summarize the key property information"
4. "Are there any special conditions?"

### Step 4: Verify Citations
- Click "Sources" button on AI response
- Verify it shows:
  - Document category (e.g., "Legal Identity")
  - Document type (e.g., "title_deed")
  - Content excerpt
  - Page number (if available)

## Troubleshooting

### Error: "Failed to get AI response"

**Check Edge Function Logs:**
```bash
supabase functions logs ai-property-assistant
```

**Common causes:**
- Gemini API key not set
- Embedding dimension mismatch
- Database function error

### Error: "No relevant information found"

**Possible causes:**
- Query embedding not matching document embeddings
- Similarity threshold too high (0.7)
- No documents processed for property

**Fix:**
Lower the threshold in the Edge Function:
```typescript
p_match_threshold: 0.5, // Lower from 0.7
```

### Error: "You do not have access to this property's documents"

**Cause:** User is not property owner and doesn't have approved access request

**Fix:** Verify user ID matches property owner_id:
```sql
SELECT owner_id FROM properties WHERE id = 'db8e5787-a221-4381-a148-9aa360b474a4';
```

### Slow Responses (>10 seconds)

**Possible causes:**
- Gemini API rate limits
- Too many chunks sent to Gemini
- Network latency

**Fix:**
Reduce match count:
```typescript
p_match_count: 3, // Lower from 5
```

## Performance Expectations

- **Response Time**: 2-5 seconds
- **Token Usage**: 500-2000 tokens per question
- **Accuracy**: High (based on document content)
- **Citations**: 2-5 sources per response

## Database Function Used

The Edge Function calls this PostgreSQL function:

```sql
search_property_documents(
  p_property_id UUID,
  p_query_embedding vector(2000),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INTEGER DEFAULT 5
)
```

This function:
1. Searches `property_document_embeddings` table
2. Uses cosine similarity (`<=>` operator)
3. Returns top N most similar chunks
4. Filters by similarity threshold

## Gemini API Details

### Embedding Model
- **Model**: `gemini-embedding-001`
- **Dimensions**: 3072 (truncated to 2000)
- **Endpoint**: `/v1beta/models/gemini-embedding-001:embedContent`

### Chat Model
- **Model**: `gemini-1.5-flash-latest`
- **Temperature**: 0.3 (factual responses)
- **Max Tokens**: 500 (concise answers)
- **Rate Limit**: 15 requests/minute (free tier)

## Success Criteria

The chat is working correctly when:
1. ✅ Chat opens without errors
2. ✅ Questions get responses within 5 seconds
3. ✅ Responses are relevant to property
4. ✅ Citations show correct sources
5. ✅ Conversation history persists
6. ✅ No console errors

## Next Steps After Successful Deployment

1. **Re-enable Auto-Trigger**
   - Edit `src/services/aiPropertyAssistantService.ts`
   - Uncomment lines 250-260 (auto-trigger logic)
   - This will automatically process new documents

2. **Monitor Performance**
   - Check Edge Function logs regularly
   - Monitor Gemini API usage
   - Track response times

3. **Gather Feedback**
   - Test with real users
   - Collect questions that work well
   - Identify areas for improvement

4. **Optimize if Needed**
   - Adjust similarity threshold
   - Tune chunk count
   - Refine system prompt

---

**Ready to deploy?** Run: `supabase functions deploy ai-property-assistant` 🚀
