
import { ChatInput } from "./chat/ChatInput";
import { ChatMessageList } from "./chat/ChatMessageList";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { ChatMessageType } from "./chat/ChatMessage";
import { ProfileFormValues } from "@/types/profile";

interface AIAssistantSectionProps {
  expandedSections: string[];
  onFindMatch: () => void;
  profileData: Partial<ProfileFormValues> | null;
  children?: React.ReactNode;
}

export function AIAssistantSection({ 
  expandedSections, 
  onFindMatch, 
  profileData,
  children
}: AIAssistantSectionProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "1",
      content: "Hi there! I'm your AI matching assistant. I can help you find the perfect roommate based on your preferences. Ask me anything about the matching process or your profile!",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: getAIResponse(content, profileData),
        sender: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg overflow-hidden">
      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">AI Matching Assistant</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Chatbot</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help finding your perfect roommate match. Ask questions about
              compatibility factors, or get suggestions on how to improve your profile.
            </p>
            
            <div className="border rounded-md overflow-hidden bg-background">
              <ChatMessageList messages={messages} />
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
          
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// Helper function to generate AI responses based on user input
function getAIResponse(message: string, profileData: Partial<ProfileFormValues> | null): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes("find match") || messageLower.includes("find roommate")) {
    return "To find your perfect roommate match, please click the 'Find My Match' button below. I'll analyze your profile data and preferences to find compatible roommates for you.";
  }
  
  if (messageLower.includes("how does") && messageLower.includes("match")) {
    return "Our matching algorithm analyzes 20+ compatibility factors including lifestyle, schedule, budget, location preferences, and personality traits to find your most compatible roommates.";
  }
  
  if (messageLower.includes("profile") && (messageLower.includes("complet") || messageLower.includes("finish"))) {
    if (!profileData || !profileData.fullName) {
      return "Your profile isn't complete yet. Please fill in your personal information in the 'About Me' section to improve your matches.";
    } else {
      const missingFields = [];
      if (!profileData.budgetRange) missingFields.push("budget range");
      if (!profileData.preferredLocation) missingFields.push("preferred location");
      if (!profileData.cleanliness) missingFields.push("cleanliness preferences");
      
      if (missingFields.length > 0) {
        return `Your profile is partially complete. Consider adding details about your ${missingFields.join(", ")} to get better matches.`;
      } else {
        return "Your profile looks great! You've provided good information for our matching algorithm to find compatible roommates for you.";
      }
    }
  }
  
  if (messageLower.includes("suggest") || messageLower.includes("recommendation")) {
    return "Based on trends we've seen, the most successful matches include detailed information about daily routines, cleanliness expectations, and communication style. Adding these details to your profile could improve your matches.";
  }
  
  // Default response
  return "I'm here to help you find your ideal roommate. You can ask me about how our matching works, get profile suggestions, or click the 'Find My Match' button when you're ready to see your matches.";
}
