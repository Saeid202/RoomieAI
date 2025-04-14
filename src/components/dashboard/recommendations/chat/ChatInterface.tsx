
import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function ChatInterface({ messages, setMessages }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');

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
    <div className="border rounded-lg w-full">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-medium text-center">Chatbot</h3>
      </div>
      
      <ScrollArea className="h-80 p-4">
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
  );
}
