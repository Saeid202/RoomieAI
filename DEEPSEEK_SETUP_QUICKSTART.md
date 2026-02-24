# DeepSeek API - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Get Your API Key (2 minutes)
1. Go to [https://platform.deepseek.com](https://platform.deepseek.com)
2. Sign up with email or GitHub
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with `sk-`)

### Step 2: Configure Supabase (2 minutes)
```bash
# Set the secret
supabase secrets set DEEPSEEK_API_KEY=sk-your-key-here

# Verify it's set
supabase secrets list
```

### Step 3: Deploy Functions (1 minute)
```bash
# Deploy both functions
supabase functions deploy process-property-document
supabase functions deploy ai-property-assistant
```

### Step 4: Test It! ✅
Upload a document and ask the AI a question. Done!

---

## 💰 Pricing

### DeepSeek (Current)
- **Embeddings**: $0.002 per 1M tokens
- **Chat**: $0.014 per 1M input, $0.280 per 1M output
- **Cost per 1000 questions**: ~$0.032

### OpenAI (Previous)
- **Cost per 1000 questions**: ~$0.17

### Savings: 81% cheaper! 🎉

---

## 🔧 Environment Variables

### .env (Local Development)
```bash
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

### Supabase (Production)
```bash
supabase secrets set DEEPSEEK_API_KEY=sk-your-key-here
```

---

## 📊 Models Used

- **Embeddings**: `deepseek-embed` (1536 dimensions)
- **Chat**: `deepseek-chat` (optimized for factual Q&A)

---

## ✅ Compatibility

DeepSeek uses OpenAI-compatible API format:
- Same request/response structure
- Same authentication (Bearer token)
- Same error handling
- Easy to switch back if needed

---

## 🆘 Troubleshooting

### "DEEPSEEK_API_KEY not configured"
```bash
supabase secrets set DEEPSEEK_API_KEY=sk-your-key
supabase functions deploy process-property-document
supabase functions deploy ai-property-assistant
```

### "401 Unauthorized"
- Check API key is correct
- Verify key is active on DeepSeek platform
- Ensure you have credits

### Need Help?
- DeepSeek Docs: https://platform.deepseek.com/docs
- DeepSeek Discord: https://discord.gg/deepseek

---

## 🎯 What's Next?

1. Upload property documents
2. Wait for AI processing (1-2 minutes)
3. Ask questions about the property
4. Get instant answers with citations!

**That's it! You're ready to go! 🚀**
