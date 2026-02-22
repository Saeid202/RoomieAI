// =====================================================
// Gemini Chat Component
// =====================================================
// Purpose: General-purpose chat interface using Gemini API
// Can be used for any conversational AI needs
// =====================================================

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Send, 
  X, 
  Sparkles, 
  Loader2,
  Trash2,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { sendChatMessage } from "@/services/geminiChatService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface GeminiChatProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  maxHistory?: number;
}

export function GeminiChat({
  isOpen,
  onClose,
  systemPrompt = "You are a helpful AI assistant. Provide clear, accurate, and friendly responses.",
  title = "AI Chat Assistant",
  subtitle = "Ask me anything!",
  placeholder = "Type your message here...",
  maxHistory = 10,
}: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Load conversation from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("gemini-chat-history");
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    }
  }, [isOpen]);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("gemini-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to UI immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // Call Gemini API via service
      const response = await sendChatMessage(
        userMessage,
        messages.map(m => ({ role: m.role, content: m.content })).slice(-maxHistory),
        systemPrompt
      );

      if (response.success && response.response) {
        // Add AI response to UI
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(response.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Remove the user message if AI failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      localStorage.removeItem("gemini-chat-history");
      toast.success("Chat history cleared");
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-purple-100">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-white hover:bg-white/20"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Start a Conversation
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                I'm powered by Google Gemini. Ask me anything - I can help with
                questions, explanations, creative writing, coding, and more!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 relative group ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                        message.role === "user"
                          ? "hover:bg-purple-700"
                          : "hover:bg-slate-100"
                      }`}
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    
                    {/* Timestamp */}
                    <p className={`text-[10px] mt-2 ${
                      message.role === "user" ? "text-purple-200" : "text-slate-400"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="resize-none min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="shrink-0 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Powered by Google Gemini • Responses may not always be accurate
          </p>
        </div>
      </Card>
    </div>
  );
}
