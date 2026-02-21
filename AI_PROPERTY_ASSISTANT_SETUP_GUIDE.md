# AI Property Assistant - Quick Setup Guide

## Prerequisites
- Supabase project with CLI installed
- OpenAI API key
- Node.js and npm/yarn

## Step-by-Step Setup

### 1. Enable pgvector Extension
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Database Migration
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual (copy/paste SQL file content into Supabase SQL Editor)
# File: supabase/migrations/20260221_ai_property_assistant_setup.sql
```

### 3. Deploy Edge Functions

#### Deploy Process Document Function
```bash
cd supabase/functions
supabase functions deploy process-property-document --no-verify-jwt
```

#### Deploy AI Assistant Function
```bash
supabase functions deploy ai-property-assistant --no-verify-jwt
```

### 4. Set Environment Variables

#### In Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add secret: `OPENAI_API_KEY` = `sk-...`

#### Or via CLI:
```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

#### In your `.env` file:
```bash
# Add OpenAI API key
OPENAI_API_KEY=sk-...

# Supabase (already configured)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### 5. Test the System

#### Test 1: Upload a Document
```typescript
// Upload a document through the UI
// It will automatically trigger AI processing
```

#### Test 2: Check Processing Status
```typescript
import { getDocumentProcessingStatus } from '@/services/aiPropertyAssistantService';

const status = await getDocumentProcessingStatus('document-id');
console.log(status);
// { status: 'completed', total_chunks: 15, processed_chunks: 15 }
```

#### Test 3: Ask a Question
```typescript
import { sendMessageToAI } from '@/services/aiPropertyAssistantService';

const response = await sendMessageToAI(
  'property-id',
  'What are the pet policies?'
);
console.log(response.response);
// "According to the bylaws, pets under 25 lbs are allowed..."
```

### 6. Verify Database Tables

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%property%ai%' 
OR table_name LIKE '%embedding%';

-- Should return:
-- property_document_embeddings
-- ai_property_conversations
-- property_document_processing_status
```

### 7. Verify Edge Functions

```bash
# List deployed functions
supabase functions list

# Should show:
# - process-property-document
# - ai-property-assistant
```

## Troubleshooting

### Issue: pgvector extension not found
```sql
-- Enable in Supabase Dashboard:
-- Database → Extensions → Search "vector" → Enable
```

### Issue: Edge function deployment fails
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm install -g supabase

# Login again
supabase login
```

### Issue: OpenAI API errors
```bash
# Verify API key is set
supabase secrets list

# Test API key manually
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: Document processing stuck
```sql
-- Check processing status
SELECT * FROM property_document_processing_status 
WHERE status = 'processing' 
AND started_at < NOW() - INTERVAL '10 minutes';

-- Reset stuck documents
UPDATE property_document_processing_status 
SET status = 'pending', started_at = NULL 
WHERE status = 'processing' 
AND started_at < NOW() - INTERVAL '10 minutes';
```

## Testing Checklist

- [ ] pgvector extension enabled
- [ ] Database migration applied
- [ ] Edge functions deployed
- [ ] OPENAI_API_KEY configured
- [ ] Document upload triggers processing
- [ ] Processing status updates correctly
- [ ] AI assistant responds to questions
- [ ] Citations included in responses
- [ ] Conversation history saves
- [ ] Access control works (RLS)

## Next Steps

After setup is complete:
1. Build UI components (chat interface)
2. Add processing status indicators
3. Create suggested questions feature
4. Add conversation export
5. Implement batch processing

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Edge Functions
2. Check browser console for errors
3. Verify RLS policies are enabled
4. Test with simple documents first (text-based PDFs)

## Cost Estimates

### OpenAI API Costs:
- Embeddings: $0.00002 per 1K tokens
- Chat: $0.00015 per 1K tokens (gpt-4o-mini)

### Example:
- 10 documents × 20 pages = 200 pages
- ~500 tokens per page = 100K tokens
- Embedding cost: $2.00
- 1000 questions × 500 tokens = 500K tokens
- Chat cost: $75.00
- **Total for 1000 questions: ~$77**

### Supabase Costs:
- Database storage: Included in free tier
- Edge function invocations: 500K free per month
- Bandwidth: 5GB free per month

## Security Notes

- All embeddings are private (service role only)
- Users can only access their own conversations
- Property owners can view all conversations for their properties
- RLS policies enforce access control
- All API calls are authenticated

---

**Setup Time**: ~15 minutes  
**Difficulty**: Intermediate  
**Status**: Ready for Production
