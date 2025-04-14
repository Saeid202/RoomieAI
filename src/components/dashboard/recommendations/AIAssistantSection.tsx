
import { useState } from "react";
import { Wand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { ChatMessageType } from "./chat/ChatMessage";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatInput } from "./chat/ChatInput";
import { LoadingButton } from "./chat/LoadingButton";

interface AIAssistantSectionProps {
  expandedSections: string[];
  onFindMatch: () => Promise<void>;
  profileData?: Partial<ProfileFormValues> | null;
}

export function AIAssistantSection({ 
  expandedSections, 
  onFindMatch, 
  profileData 
}: AIAssistantSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm your AI matching assistant. I can help you find the perfect roommate based on your preferences. What questions do you have about the matching process?",
      timestamp: new Date()
    }
  ]);

  const handleFindMatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onFindMatch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate AI response based on user query
    setTimeout(() => {
      let response = '';
      const userQuery = content.toLowerCase();
      
      if (userQuery.includes('match') || userQuery.includes('roommate') || userQuery.includes('find')) {
        response = "I can help you find a compatible roommate! First, make sure you've filled out your profile and roommate preferences completely. The more details you provide, the better matches I can find for you.";
      } else if (userQuery.includes('profile') || userQuery.includes('information')) {
        response = "Your profile helps potential roommates learn about you. Be sure to fill out all sections in 'About Me', including your lifestyle, habits, and preferences. This helps our algorithm find better matches!";
      } else if (userQuery.includes('preference') || userQuery.includes('deal breaker')) {
        response = "Your preferences and deal breakers are crucial for finding a good match. Make sure to set these in the 'Ideal Roommate' section. The more specific you are, the better matches we can find!";
      } else if (userQuery.includes('hello') || userQuery.includes('hi') || userQuery.includes('hey')) {
        response = "Hi there! How can I help you with your roommate search today?";
      } else if (userQuery.includes('thank')) {
        response = "You're welcome! Feel free to ask if you have any other questions about finding your ideal roommate.";
      } else {
        response = "Thanks for your question! To find a great roommate match, make sure your profile is complete and your preferences are set. Is there anything specific about the matching process you'd like to know?";
      }
      
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Wand className="h-5 w-5" />
          <span className="text-xl font-semibold">AI Matching Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col space-y-4">
              {/* AI Matching Assistant Header */}
              <div className="bg-white p-6 border-b">
                <h3 className="text-2xl font-bold text-center">AI Matching Assistant</h3>
              </div>
              
              {/* Chatbot Section */}
              <div className="px-6">
                <div className="border rounded-lg">
                  <div className="p-3 border-b bg-muted/30">
                    <h3 className="font-medium text-center">Chatbot</h3>
                  </div>
                  
                  <ChatMessageList messages={messages} />
                  
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              </div>
              
              {/* Find My Match Button - centered and prominent */}
              <div className="flex justify-center pb-6 px-6">
                <LoadingButton isLoading={isLoading} onClick={handleFindMatch} />
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
