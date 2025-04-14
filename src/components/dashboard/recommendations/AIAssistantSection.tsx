
import { BrainCircuit, SendHorizonal, Search } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantSectionProps {
  expandedSections: string[];
  onFindMatch: () => void;
}

export function AIAssistantSection({ expandedSections, onFindMatch }: AIAssistantSectionProps) {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; content: string }[]>([
    { sender: 'ai', content: 'Hello! I\'m your roommate matching assistant. How can I help you find your perfect roommate?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', content: inputValue }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          content: "Thanks for sharing! I've noted your preferences and will use them to find better matches for you." 
        }
      ]);
    }, 1000);
    
    setInputValue('');
  };

  const handleFindMatch = () => {
    toast({
      title: "Finding matches",
      description: "Searching for your ideal roommate based on your preferences...",
    });
    onFindMatch();
  };

  return (
    <AccordionItem value="ai-assistant" className="border rounded-lg">
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          <span className="text-xl font-semibold">Chat with AI Assistant</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col h-[250px]">
              <div className="flex-1 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`mb-2 ${message.sender === 'user' ? 'text-right' : ''}`}
                  >
                    <div 
                      className={`inline-block p-2 rounded-lg max-w-[80%] text-sm ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mb-3">
                <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                  <Input 
                    placeholder="Ask about roommate preferences..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </form>
                
                <Button 
                  onClick={handleFindMatch}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Find Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}
