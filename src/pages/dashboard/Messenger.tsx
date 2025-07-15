import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { getMockRoommates } from "@/utils/matchingAlgorithm/mockData";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  senderId: string;
}

interface ChatConversation {
  id: string;
  participantName: string;
  participantId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  matchPercentage: number;
}

export default function MessengerPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const dbMatches = await getMockRoommates();
        
        // Convert first few matches to conversations for demo
        const mockConversations: ChatConversation[] = dbMatches.slice(0, 5).map((match, index) => ({
          id: `conv-${index}`,
          participantName: match.name,
          participantId: `user-${index + 2}`,
          lastMessage: getRandomMessage(),
          lastMessageTime: new Date(Date.now() - Math.random() * 86400000), // Random time within last day
          unreadCount: Math.floor(Math.random() * 3),
          matchPercentage: match.compatibilityScore,
        }));
        
        setConversations(mockConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const getRandomMessage = () => {
    const messages = [
      "Hi! I saw we matched. Would love to chat about our housing preferences.",
      "Thanks for reaching out! When are you looking to move?",
      "Great! Let's discuss the budget and location preferences.",
      "I'm really interested in finding a compatible roommate. What do you think?",
      "Your profile looks great! Are you still looking for a place?"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Mock messages for selected conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! I saw we matched with 92% compatibility. Would love to chat about our housing preferences!",
      sender: "Sarah Johnson",
      senderId: "user-2",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "2",
      content: "Hi Sarah! Yes, I'd love to discuss that. What area are you looking at?",
      sender: "You",
      senderId: user?.id || "current-user",
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: "3",
      content: "I'm primarily looking in the downtown area, close to transit. What about you?",
      sender: "Sarah Johnson",
      senderId: "user-2",
      timestamp: new Date(Date.now() - 30000),
    },
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: messageInput,
      sender: "You",
      senderId: user?.id || "current-user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
        {/* Conversations List */}
        <div className="col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Matches & Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-4">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedChat === conversation.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.participantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.participantName}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {conversation.matchPercentage}%
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {conversation.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-8">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedConversation?.participantName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation?.participantName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation?.matchPercentage}% match • Online
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === (user?.id || "current-user")
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[80%] ${
                            message.senderId === (user?.id || "current-user")
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback>
                              {message.senderId === (user?.id || "current-user")
                                ? user?.email?.[0]?.toUpperCase() || "U"
                                : message.sender.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.senderId === (user?.id || "current-user")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a matched roommate to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}