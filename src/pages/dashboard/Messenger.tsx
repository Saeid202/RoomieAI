import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Search, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { messagingService, Conversation, Message } from "@/services/messagingService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function MessengerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(conversationId || null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        console.log('=== LOADING CONVERSATIONS ===');
        console.log('User:', user);
        console.log('User ID:', user?.id);
        
        const list = await messagingService.listConversations();
        console.log('Conversations loaded:', list);
        setConversations(list);
      } catch (error) {
        console.error("=== ERROR LOADING CONVERSATIONS ===", error);
        console.error("Error details:", error);
        setConversations([]);
        toast.error(`Failed to load conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [user]);

  // Load messages for selected conversation and subscribe to realtime
  useEffect(() => {
    if (!selectedChat) return;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        console.log('=== LOADING MESSAGES ===');
        console.log('Selected chat:', selectedChat);
        console.log('User:', user);
        
        const initial = await messagingService.getMessages(selectedChat);
        console.log('Messages loaded:', initial);
        setMessages(initial);
        
        unsubscribe = messagingService.subscribeToConversation(selectedChat, {
          onInsert: (msg) => {
            console.log('New message received:', msg);
            setMessages((prev) => [...prev, msg]);
            if (msg.sender_id !== (user?.id || 'current-user')) {
              toast.info('New message received');
            }
          },
          onUpdate: (msg) => setMessages((prev) => prev.map(m => m.id === msg.id ? msg : m)),
          onDelete: (msg) => setMessages((prev) => prev.filter(m => m.id !== msg.id)),
        });
        
        await messagingService.markRead(selectedChat);
        navigate(`/dashboard/messenger/${selectedChat}`, { replace: true });
      } catch (e) {
        console.error('=== FAILED TO LOAD MESSAGES ===', e);
        console.error('Error details:', e);
        toast.error(`Failed to load messages: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    })();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [selectedChat, user, dataVersion]);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => (c.title || '').toLowerCase().includes(q));
  }, [conversations, searchTerm]);

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    console.log('=== SENDING MESSAGE ===');
    console.log('Message input:', messageInput);
    console.log('Selected chat:', selectedChat);
    console.log('User:', user);
    
    const text = messageInput;
    setMessageInput("");
    try {
      const result = await messagingService.sendMessage(selectedChat, text, 'text');
      console.log('Message sent successfully:', result);
      setDataVersion(prev => prev + 1);
      toast.success('Message sent!');
    } catch (e) {
      console.error('=== SEND MESSAGE FAILED ===', e);
      console.error('Error details:', e);
      toast.error(`Failed to send message: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setMessageInput(text); // Restore the message if sending failed
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedChat) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await messagingService.uploadAttachment(selectedChat, file);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      e.currentTarget.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (iso: string): string => {
    const date = new Date(iso);
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
              <CardTitle className="flex items-center gap-2 text-roomie-orange">
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
                            {(conversation.title || 'Chat').slice(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.title || 'Conversation'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {conversation.last_message_at ? formatTime(conversation.last_message_at) : ''}
                              </span>
                            </div>
                          </div>
                          {/* TODO: show last message preview and unread count via join */}
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
                      {(selectedConversation?.title || 'Chat').slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation?.title || 'Conversation'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Online
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
                          message.sender_id === (user?.id || "current-user")
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[80%] ${
                            message.sender_id === (user?.id || "current-user")
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback>
                              {message.sender_id === (user?.id || "current-user")
                                ? user?.email?.[0]?.toUpperCase() || "U"
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.sender_id === (user?.id || "current-user")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-4 flex gap-2">
                  <label className="inline-flex items-center justify-center w-10 h-10 rounded-md border cursor-pointer text-muted-foreground hover:bg-muted">
                    <Paperclip className="h-4 w-4" />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
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
                  Choose a conversation to start chatting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}