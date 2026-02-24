# AI Chatbot Fix - Deployment Guide

## Issue Found
The AI chatbot was not responding because the Gemini API model name changed:
- **Old (broken)**: `gemini-1.5-flash-latest` 
- **New (working)**: `gemini-2.5-flash`

## What Was Fixed
Updated `supabase/functions/ai-property-assistant/index.ts`:
1. Changed model name from `gemini-1.5-flash-latest` to `gemini-2.5-flash`
2. Changed API endpoint from `/v1/` to `/v1beta/`

## Deployment Steps

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd C:\Users\shaba\RoomieAI

# Deploy the updated edge function
npx supabase functions deploy ai-property-assistant
```

### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/functions
2. Click on `ai-property-assistant` function
3. Click "Edit Function"
4. Copy the entire content from `supabase/functions/ai-property-assistant/index.ts`
5. Paste it into the editor
6. Click "Deploy"

## Verification

After deployment, test the chatbot:
1. Go to a property with documents
2. Open the AI chat
3. Ask a question like "Hello, can you help me?"
4. You should receive a response

## API Test Results

✅ Gemini API is working correctly:
- Model: `gemini-2.5-flash`
- Response: "Yes, I can hear you!"
- Status: 200 OK

## Environment Variables

Confirmed in Supabase Dashboard:
- `GEMINI_API_KEY` is set correctly
- API key is valid and working

## Next Steps

After deploying, if the chatbot still doesn't work:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify the property has processed documents
