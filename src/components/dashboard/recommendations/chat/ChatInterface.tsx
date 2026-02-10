
import { useState, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageType } from "./ChatMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatInterfaceProps {
  matchingProfileData?: any;
}

export function ChatInterface({ matchingProfileData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your professional AI Matching Assistant. I can provide detailed insights about compatibility factors, matching algorithms, and help you understand your roommate preferences. How may I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  // Add new message to the list
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Generate AI response
    setTimeout(() => {
      const botResponse = generateResponse(content, matchingProfileData);
      const botMessage: ChatMessageType = {
        id: `bot-${Date.now()}`,
        content: botResponse,
        sender: "assistant", // Changed from "ai" to "assistant"
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <Card className="w-full shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                AI Matching Assistant
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Professional roommate compatibility guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">{messages.length - 1} messages</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[500px]">
        <ChatMessageList messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </CardContent>
    </Card>
  );
}

// Helper function to generate responses based on user input
function generateResponse(userInput: string, profileData: any): string {
  const input = userInput.toLowerCase();
  
  if (input.includes("algorithm") || input.includes("matching") || input.includes("how does it work")) {
    return "Our proprietary matching algorithm utilizes advanced compatibility analysis across multiple dimensions: lifestyle preferences, budget alignment, geographic proximity, and behavioral patterns. The system employs weighted scoring to identify optimal roommate pairings with a 94% success rate for long-term compatibility.";
  }
  
  if (input.includes("budget") || input.includes("price") || input.includes("cost")) {
    return "Financial compatibility is a critical factor in sustainable roommate relationships. Our algorithm analyzes budget ranges, payment preferences, and financial responsibility patterns to ensure harmonious living arrangements. We recommend maintaining a 15% buffer for unexpected expenses.";
  }
  
  if (input.includes("location") || input.includes("area") || input.includes("neighborhood")) {
    return "Location matching incorporates geographic proximity, neighborhood preferences, transportation access, and local amenities. The system prioritizes matches within a 2-mile radius while considering commute patterns and lifestyle requirements.";
  }
  
  if (input.includes("lifestyle") || input.includes("habits")) {
    return "Lifestyle compatibility assessment evaluates cleanliness standards, sleep schedules, social preferences, work habits, and dietary restrictions. These factors are weighted based on their impact on daily living harmony and long-term cohabitation success.";
  }
  
  if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
    return "Welcome. I'm here to provide professional guidance on your roommate matching journey. What specific aspect of compatibility analysis would you like to explore?";
  }
  
  return "I specialize in roommate compatibility analysis and matching algorithms. Please inquire about specific factors such as budget alignment, location preferences, lifestyle compatibility, or the technical aspects of our matching system.";
}
