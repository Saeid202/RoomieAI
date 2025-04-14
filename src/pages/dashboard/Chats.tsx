
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessageType } from "@/components/dashboard/recommendations/chat/ChatMessage";
import { ChatMessageList } from "@/components/dashboard/recommendations/chat/ChatMessageList";
import { ChatInput } from "@/components/dashboard/recommendations/chat/ChatInput";
import { LoadingButton } from "@/components/dashboard/recommendations/chat/LoadingButton";

export default function ChatsPage() {
  useEffect(() => {
    document.title = "Chats | RoomieMatch";
  }, []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      sender: 'ai',
      content: "Hi there! I'm your AI matching assistant. I can help you find the perfect roommate based on your preferences. What questions do you have about the matching process?",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
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
        sender: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleFindMatch = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          sender: 'ai',
          content: "I've analyzed your profile and preferences! To see your matches, please go to the Roommate Recommendations section in your dashboard.",
          timestamp: new Date()
        }
      ]);
    }, 2000);
  };
  
  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">AI Matching Assistant</CardTitle>
          <CardDescription className="text-center">Let me help you find your perfect roommate match</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col space-y-4">
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
    </div>
  );
}
