# 🔧 Fix Gemini Chat - API Key Issue

## Problem

The Gemini Chat is not working because the API key in Supabase Dashboard doesn't have access to the Gemini models.

## Solution

Update the `GEMINI_API_KEY` in Supabase Dashboard to use the correct key from your `.env` file.

## Steps to Fix

### 1. Get the Correct API Key

From your `.env` file:
```
GEMINI_API_KEY=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0
```

### 2. Update Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/settings/functions
2. Click on "Edge Functions" in the left sidebar
3. Click on "Manage environment variables"
4. Find `GEMINI_API_KEY`
5. Update the value to: `AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0`
6. Click "Save"

### 3. Test Again

After updating the API key:

```bash
node test_gemini_chat.js
```

You should see:
```
✅ SUCCESS! AI Response: [Gemini's response]
```

### 4. Test in Browser

1. Navigate to `/dashboard`
2. Click the floating purple chat button
3. Type: "Hello!"
4. You should get a response

## Alternative: Use Different Model

If the API key still doesn't work, we can try using a different Gemini model. The available models are:
- `gemini-pro` (older, more stable)
- `gemini-1.5-pro` (newer, more capable)
- `gemini-1.5-flash` (faster, cheaper)

The Edge Function is currently trying to use `gemini-pro`.

## Check API Key Permissions

To verify your API key has access to Gemini models, test it directly:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCfhNK4gGKbA-y5OAR_gFJXFNOHtOTzaE0"
```

This will list all models your API key has access to.

## If Still Not Working

If the API key from `.env` doesn't work either, you may need to:

1. **Create a new Gemini API key**:
   - Go to: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Enable the Gemini API
   - Update both `.env` and Supabase Dashboard

2. **Check API quotas**:
   - Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
   - Verify you haven't exceeded free tier limits

3. **Enable the API**:
   - Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Click "Enable" if not already enabled

## Current Status

- ❌ Edge Function deployed but API key issue
- ✅ UI components working
- ✅ Service layer working
- ⏸️ Waiting for correct API key

## Next Steps

1. Update `GEMINI_API_KEY` in Supabase Dashboard
2. Test with `node test_gemini_chat.js`
3. Test in browser
4. Start chatting!

---

**Quick Fix**: Update the API key in Supabase Dashboard and you're good to go! 🚀
