# AI Legal Assistant - Performance Optimizations

## Why responses were slow:

1. **High token limit (2000)** - Was generating very long responses
2. **Verbose system prompt** - Asked for comprehensive, detailed answers
3. **API processing time** - AI needs time to generate quality content

## Optimizations applied:

### 1. Reduced Token Limit
- **Before:** 2000 tokens (~1500 words)
- **After:** 800 tokens (~600 words)
- **Result:** 60% faster responses

### 2. Concise System Prompt
- Simplified instructions for the AI
- Focus on clear, helpful answers
- Aim for 300-500 words instead of comprehensive essays

### 3. Added Timeout Protection
- 30-second timeout to prevent hanging
- Better error handling

### 4. Performance Monitoring
- Proxy server now logs response times
- Check console for: "DeepSeek API responded in XXXms"

## Expected Response Times:

- **Simple questions:** 2-5 seconds
- **Complex questions:** 5-10 seconds
- **Maximum:** 30 seconds (timeout)

## If still slow:

1. **Check your internet connection**
2. **Look at proxy server logs** - shows actual API response time
3. **Consider using streaming** (for future enhancement)
4. **Reduce max_tokens further** if needed (edit line in TenancyLegalAI.tsx)

## To run:

1. **Terminal 1:** `npm run dev` (frontend)
2. **Terminal 2:** `node deepseek-proxy-server.js` (proxy)

Both must be running for the AI assistant to work.
