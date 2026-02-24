# 🚀 Gemini Chat - Quick Start Guide

## What You Got

A complete, production-ready chat component powered by Google Gemini API that you can use anywhere in your app.

## 3-Step Setup

### 1. Deploy Edge Function (30 seconds)

```bash
supabase functions deploy gemini-chat
```

### 2. Add to Any Page (2 minutes)

```typescript
import { useState } from "react";
import { GeminiChat } from "@/components/chat/GeminiChat";

function MyPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <button onClick={() => setChatOpen(true)}>
        💬 Open AI Chat
      </button>
      
      <GeminiChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}
```

### 3. Test It!

Click the button, type a message, get AI response. Done! ✅

## Customize It

### Change the AI's Personality

```typescript
<GeminiChat
  isOpen={chatOpen}
  onClose={() => setChatOpen(false)}
  systemPrompt="You are a friendly real estate expert. Help users understand properties."
  title="Real Estate Assistant"
  subtitle="Ask about properties"
  placeholder="Ask about real estate..."
/>
```

### Examples

**Code Helper:**
```typescript
systemPrompt="You are an expert programmer. Help with code and debugging."
title="Code Helper"
```

**Writing Assistant:**
```typescript
systemPrompt="You are a professional writer. Help with creative and professional writing."
title="Writing Assistant"
```

**Customer Support:**
```typescript
systemPrompt="You are a friendly support agent. Help users with their questions."
title="Customer Support"
```

## Features Out of the Box

✅ Natural conversations with context
✅ Chat history saved locally
✅ Copy messages
✅ Clear chat
✅ Beautiful UI
✅ Mobile responsive
✅ Loading indicators
✅ Error handling

## Cost

**$0** - Uses your existing Gemini API key (free tier: 15 requests/min, 1M tokens/day)

## Files Created

1. `src/components/chat/GeminiChat.tsx` - Chat UI component
2. `supabase/functions/gemini-chat/index.ts` - Edge Function
3. `src/services/geminiChatService.ts` - Service layer
4. `src/pages/dashboard/AIChat.tsx` - Example page with presets

## Try the Example Page

Navigate to `/dashboard/ai-chat` to see:
- General Assistant
- Code Helper
- Writing Assistant
- Brainstorm Buddy

Each with specialized system prompts!

## Common Use Cases

1. **Customer Support** - Answer user questions
2. **Code Help** - Programming assistance
3. **Content Writing** - Blog posts, articles
4. **Brainstorming** - Generate ideas
5. **Education** - Tutoring and explanations
6. **Translation** - Language translation
7. **Research** - Information gathering

## Next Steps

1. Deploy: `supabase functions deploy gemini-chat`
2. Add to your page (copy example above)
3. Customize system prompt for your use case
4. Test and iterate!

---

**That's it!** You now have a powerful AI chat assistant ready to use anywhere in your app. 🎉
