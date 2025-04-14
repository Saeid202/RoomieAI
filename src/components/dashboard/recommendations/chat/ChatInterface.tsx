
import { useState, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageType } from "./ChatMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface ChatInterfaceProps {
  matchingProfileData?: any;
}

export function ChatInterface({ matchingProfileData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome-message",
      content: "Hi there! I'm your Roommate AI Assistant. Ask me anything about your matches or how the matching algorithm works!",
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
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-roomie-purple" />
          <span>Roommate Matching Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
    return "Our matching algorithm analyzes compatibility based on lifestyle, budget, location, and personal preferences. We look at factors like cleanliness, sleep schedules, and social habits to find your ideal roommate match.";
  }
  
  if (input.includes("budget") || input.includes("price") || input.includes("cost")) {
    return "Budget compatibility is an important factor in our matching algorithm. We try to find roommates with similar budget ranges to ensure a good financial fit.";
  }
  
  if (input.includes("location") || input.includes("area") || input.includes("neighborhood")) {
    return "Location preferences are matched based on your desired neighborhoods or areas. The closer your preferred locations align, the higher the compatibility score.";
  }
  
  if (input.includes("lifestyle") || input.includes("habits")) {
    return "Lifestyle compatibility includes factors like cleanliness, sleep schedules, social activity, and more. These factors significantly impact your daily living experience with a roommate.";
  }
  
  if (input.includes("hi") || input.includes("hello") || input.includes("hey")) {
    return "Hello! How can I help you with finding your ideal roommate today?";
  }
  
  return "I'm not sure I understand your question. You can ask me about how our matching algorithm works, compatibility factors, or specific aspects of roommate matching like budget, location, or lifestyle preferences.";
}
