// =====================================================
// Gemini Chat - Edge Function
// =====================================================
// Purpose: General-purpose chat using Google Gemini API
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    // Get Gemini API key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Parse request
    const {
      message,
      conversationHistory = [],
      systemPrompt = "You are a helpful AI assistant. Provide clear, accurate, and friendly responses.",
      temperature = 0.7,
      maxTokens = 1000,
    }: ChatRequest = await req.json();

    console.log("💬 Gemini Chat request:", { message, historyLength: conversationHistory.length });

    // Build conversation for Gemini format
    const contents = [];

    // Add system instruction as first user message
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'll follow these instructions." }],
    });

    // Add conversation history (last 10 messages)
    conversationHistory.slice(-10).forEach((msg) => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    });

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Gemini API error:", error);
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
    const responseTime = Date.now() - startTime;

    console.log(`✅ Response generated in ${responseTime}ms (${tokensUsed} tokens)`);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        tokensUsed,
        responseTime,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in Gemini chat:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as any).message || "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
