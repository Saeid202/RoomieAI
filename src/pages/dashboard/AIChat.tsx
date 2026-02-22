// =====================================================
// AI Chat Page
// =====================================================
// Purpose: Example page showing how to use GeminiChat
// =====================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeminiChat } from "@/components/chat/GeminiChat";
import { MessageCircle, Sparkles, Code, BookOpen, Lightbulb } from "lucide-react";

export default function AIChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatConfig, setChatConfig] = useState({
    systemPrompt: "You are a helpful AI assistant. Provide clear, accurate, and friendly responses.",
    title: "AI Chat Assistant",
    subtitle: "Ask me anything!",
    placeholder: "Type your message here...",
  });

  const presetChats = [
    {
      icon: MessageCircle,
      title: "General Assistant",
      subtitle: "Ask anything",
      systemPrompt: "You are a helpful AI assistant. Provide clear, accurate, and friendly responses.",
      placeholder: "Ask me anything...",
    },
    {
      icon: Code,
      title: "Code Helper",
      subtitle: "Programming assistance",
      systemPrompt: "You are an expert programming assistant. Help users with code, debugging, best practices, and technical questions. Provide code examples when helpful.",
      placeholder: "Ask about coding, debugging, or best practices...",
    },
    {
      icon: BookOpen,
      title: "Writing Assistant",
      subtitle: "Creative & professional writing",
      systemPrompt: "You are a professional writing assistant. Help users with creative writing, editing, grammar, style, and content creation. Be encouraging and constructive.",
      placeholder: "Need help with writing? Ask me...",
    },
    {
      icon: Lightbulb,
      title: "Brainstorm Buddy",
      subtitle: "Ideas & creativity",
      systemPrompt: "You are a creative brainstorming partner. Help users generate ideas, explore possibilities, and think outside the box. Be enthusiastic and imaginative.",
      placeholder: "Let's brainstorm together...",
    },
  ];

  const openChat = (preset: typeof presetChats[0]) => {
    setChatConfig({
      systemPrompt: preset.systemPrompt,
      title: preset.title,
      subtitle: preset.subtitle,
      placeholder: preset.placeholder,
    });
    setIsChatOpen(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Chat Assistant</h1>
            <p className="text-slate-600">Powered by Google Gemini</p>
          </div>
        </div>
        <p className="text-slate-600 mt-4">
          Choose a specialized assistant below or start a general conversation. Your chat history
          is saved locally in your browser.
        </p>
      </div>

      {/* Preset Chat Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {presetChats.map((preset, index) => {
          const Icon = preset.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300"
              onClick={() => openChat(preset)}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {preset.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">{preset.subtitle}</p>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChat(preset);
                    }}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Features */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">💬 Natural Conversations</h3>
            <p className="text-sm text-slate-600">
              Have natural, flowing conversations with context awareness
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">💾 Local History</h3>
            <p className="text-sm text-slate-600">
              Your conversations are saved locally in your browser
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">🎯 Specialized Modes</h3>
            <p className="text-sm text-slate-600">
              Choose from different AI personalities for specific tasks
            </p>
          </div>
        </div>
      </Card>

      {/* Chat Component */}
      <GeminiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        systemPrompt={chatConfig.systemPrompt}
        title={chatConfig.title}
        subtitle={chatConfig.subtitle}
        placeholder={chatConfig.placeholder}
      />
    </div>
  );
}
