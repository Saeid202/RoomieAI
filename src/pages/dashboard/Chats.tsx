
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatMessageType } from "@/components/dashboard/recommendations/chat/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function ChatsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome-message",
      content: "Hi there! I'm your AI assistant. How can I help you today?",
      sender: "assistant", // Changed from "ai" to "assistant"
      timestamp: new Date(),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(messageInput);
      const aiMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: "assistant", // Changed from "ai" to "assistant"
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle>AI Legal Assistant</CardTitle>
          <p className="text-sm text-muted-foreground">Ask questions about real estate law and housing regulations</p>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      {message.sender === "user" ? (
                        <div className="bg-blue-500 h-full w-full flex items-center justify-center text-white">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                      ) : (
                        <div className="bg-green-500 h-full w-full flex items-center justify-center text-white">
                          A
                        </div>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 mt-1">
                      <div className="bg-green-500 h-full w-full flex items-center justify-center text-white">
                        A
                      </div>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4 flex gap-2">
            <Input
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you with your housing search today?";
  }
  
  if (lowerMessage.includes("roommate")) {
    return "Looking for a roommate? You can use our roommate recommendation system to find your perfect match based on lifestyle, preferences, and compatibility!";
  }
  
  if (lowerMessage.includes("rent") || lowerMessage.includes("price")) {
    return "Our system can help you find affordable rental options within your budget. You can filter by price range, location, and amenities on our Rent Opportunities page.";
  }
  
  if (lowerMessage.includes("buy") || lowerMessage.includes("purchase")) {
    return "Browse our property listings to find rental opportunities that match your budget and preferences.";
  }
  
  return "I'm here to help with legal questions about real estate, tenant rights, landlord responsibilities, lease agreements, security deposits, and housing regulations. What would you like to know?";
}
