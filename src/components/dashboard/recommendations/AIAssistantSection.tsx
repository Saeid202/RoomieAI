
import { useState } from "react";
import { Wand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { ChatInterface, ChatMessage } from "./chat/ChatInterface";
import { ProfileCompletionChecklist } from "./profile/ProfileCompletionChecklist";
import { MatchButton } from "./match/MatchButton";

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
  const [messages, setMessages] = useState<ChatMessage[]>([
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

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <Wand className="h-5 w-5" />
          <span className="text-xl font-semibold">AI Matching Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center">AI Matching Assistant</h3>
              
              {/* Chatbot - always visible */}
              <ChatInterface messages={messages} setMessages={setMessages} />
              
              {/* Profile check section */}
              <ProfileCompletionChecklist profileData={profileData} />
              
              {/* Find Match button */}
              <MatchButton isLoading={isLoading} onFindMatch={handleFindMatch} />
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
