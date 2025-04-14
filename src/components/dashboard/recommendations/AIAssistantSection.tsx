
import { useState } from "react";
import { Wand, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProfileFormValues } from "@/types/profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface AIAssistantSectionProps {
  expandedSections: string[];
  onFindMatch: () => Promise<void>;
  profileData?: Partial<ProfileFormValues> | null;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function AIAssistantSection({ 
  expandedSections, 
  onFindMatch, 
  profileData 
}: AIAssistantSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Generate AI response based on user query
    setTimeout(() => {
      let response = '';
      const userQuery = inputValue.toLowerCase();
      
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
      
      const assistantMessage: ChatMessage = {
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
            {/* Simplified layout based on the image */}
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
                  
                  <ScrollArea className="h-60 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                              <div className={message.role === 'assistant' ? "bg-roomie-purple text-white w-full h-full flex items-center justify-center" : "bg-gray-200 w-full h-full flex items-center justify-center"}>
                                {message.role === 'assistant' ? 'AI' : 'You'}
                              </div>
                            </Avatar>
                            <div 
                              className={`rounded-lg p-3 text-sm ${
                                message.role === 'assistant' 
                                  ? 'bg-muted/50 text-foreground' 
                                  : 'bg-roomie-purple/80 text-white'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-3 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about roommate matching..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <SendHorizontal className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
              
              {/* Find My Match Button - centered and prominent */}
              <div className="flex justify-center pb-6 px-6">
                <Button 
                  onClick={handleFindMatch} 
                  disabled={isLoading}
                  className="w-full md:w-1/2 py-6 text-lg font-medium"
                  variant="default"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding Your Match...
                    </div>
                  ) : (
                    <>Find My Match</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
