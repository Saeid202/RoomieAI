// =====================================================
// Gemini Chat Service
// =====================================================
// Purpose: Client-side service for Gemini chat
// =====================================================

import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  tokensUsed?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Send a message to Gemini AI
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
  systemPrompt?: string,
  temperature?: number,
  maxTokens?: number
): Promise<ChatResponse> {
  try {
    console.log("💬 Sending message to Gemini:", message);

    const { data, error } = await supabase.functions.invoke("gemini-chat", {
      body: {
        message,
        conversationHistory,
        systemPrompt,
        temperature,
        maxTokens,
      },
    });

    if (error) {
      console.error("❌ Error from Gemini chat:", error);
      throw error;
    }

    console.log("✅ Gemini response received");
    return data as ChatResponse;
  } catch (error) {
    console.error("❌ Failed to send chat message:", error);
    return {
      success: false,
      error: (error as any).message || "Failed to get AI response",
    };
  }
}

/**
 * Generate a response with custom system prompt
 */
export async function generateWithPrompt(
  userMessage: string,
  systemPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  const response = await sendChatMessage(
    userMessage,
    [],
    systemPrompt,
    temperature
  );

  if (!response.success || !response.response) {
    throw new Error(response.error || "Failed to generate response");
  }

  return response.response;
}

/**
 * Continue a conversation with history
 */
export async function continueConversation(
  message: string,
  history: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const response = await sendChatMessage(message, history, systemPrompt);

  if (!response.success || !response.response) {
    throw new Error(response.error || "Failed to continue conversation");
  }

  return response.response;
}
