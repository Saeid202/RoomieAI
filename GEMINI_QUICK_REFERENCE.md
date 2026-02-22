# Gemini API - Quick Reference Card

## 🚀 5-Minute Setup

```bash
# 1. Get API key: https://aistudio.google.com/app/apikey
# 2. Set environment variable
supabase secrets set GEMINI_API_KEY=AIzaSy...

# 3. Run migration
supabase db push

# 4. Deploy functions
supabase functions deploy process-property-document
supabase functions deploy ai-property-assistant

# 5. Test it!
```

---

## 📊 Free Tier Limits

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Tokens per day | 1,000,000 |
| Cost | **$0.00** |
| Duration | **Forever** |

---

## 🎯 Your Usage

| Activity | API Calls | Within Limit? |
|----------|-----------|---------------|
| Process 1 document | ~50 | ✅ Yes |
| Process 30 documents/day | ~1,500 | ✅ Yes |
| Answer 50 questions/day | ~50 | ✅ Yes |
| **Total daily** | **~1,550** | ✅ Yes! |

---

## 🔧 Models Used

```typescript
// Embeddings
model: "text-embedding-004"
dimensions: 768
cost: FREE

// Chat
model: "gemini-1.5-flash"
context: 1M tokens
cost: FREE
```

---

## 📝 API Endpoints

```bash
# Base URL
https://generativelanguage.googleapis.com/v1beta

# Embeddings
POST /models/text-embedding-004:embedContent?key=YOUR_KEY

# Chat
POST /models/gemini-1.5-flash:generateContent?key=YOUR_KEY
```

---

## 🆘 Quick Troubleshooting

```bash
# Issue: "GEMINI_API_KEY not configured"
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase functions deploy process-property-document
supabase functions deploy ai-property-assistant

# Issue: "429 Too Many Requests"
# Wait 1 minute, you hit 15 RPM limit

# Issue: "400 Bad Request"
# Check API key is correct (starts with AIza)
```

---

## 💰 Cost Comparison

| Provider | Free Tier | Cost/1K Questions |
|----------|-----------|-------------------|
| **Gemini** | ✅ 1500/day | **$0.00** |
| DeepSeek | ❌ No | $0.032 |
| OpenAI | ❌ No | $0.17 |

**Savings: 100%!** 🎉

---

## 📚 Quick Links

- Get API Key: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing
- Dashboard: https://aistudio.google.com

---

## ✅ Checklist

- [ ] Get Gemini API key
- [ ] Set Supabase secret
- [ ] Run migration
- [ ] Deploy functions
- [ ] Test document upload
- [ ] Test AI chat
- [ ] Monitor usage
- [ ] Celebrate! 🎉

---

**Setup Time**: 5 minutes  
**Cost**: $0.00  
**Status**: Production Ready
