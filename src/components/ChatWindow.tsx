import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Phone, Video, Info } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages, Message } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface ChatWindowProps {
  conversation: ConversationWithMessages | null;
  onBack?: () => void;
  className?: string;
}

export function ChatWindow({
  conversation,
  onBack,
  className,
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    let subscription: { unsubscribe: () => void } | null = null;

    const setup = async () => {
      await loadMessages();

      // Subscribe to real-time updates
      subscription = MessagingService.subscribeToMessages(
        conversation.id,
        (newMessage) => {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            const exists = prev.find((m) => m.id === newMessage.id);
            if (exists) return prev;
            const updated = [...prev, newMessage];
            // Scroll after state update
            setTimeout(() => scrollToBottom(), 50);
            return updated;
          });
        }
      );
    };

    setup();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length, loading]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const data = await MessagingService.getMessages(conversation.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!conversation || !messageInput.trim() || sending) return;

    try {
      setSending(true);
      await MessagingService.sendMessage(conversation.id, messageInput.trim());
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  };

  const getOtherParticipantName = () => {
    if (!conversation) return "User";
    if (user?.id === conversation.landlord_id) {
      return conversation.tenant_name || "Tenant";
    }
    return conversation.landlord_name || "Landlord";
  };

  const otherParticipantName = getOtherParticipantName();

  if (!conversation) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-background/50 text-center ${className}`}>
        <div className="bg-background rounded-full p-6 shadow-sm mb-4">
          {/* SVG Placeholder for empty state */}
          <svg className="w-16 h-16 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
        <p className="text-muted-foreground max-w-sm">
          Select a chat from the left to view conversation details or start a new one.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="relative">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                {otherParticipantName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator mock - dynamic in real app */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full ring-1 ring-background"></span>
          </div>

          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {otherParticipantName}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {conversation.property_title || "Active now"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-full h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-full h-9 w-9">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-full h-9 w-9">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-muted/30" ref={scrollAreaRef}>
        <div className="px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Avatar className="h-20 w-20 mb-4 opacity-50">
                <AvatarFallback className="text-2xl">{otherParticipantName[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium">You are now connected on RoomieAI</p>
              <p className="text-sm mt-1">Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                // Check if previous message was from same sender to group them (optional styling enhancement)
                // const isSequence = index > 0 && messages[index - 1].sender_id === message.sender_id;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 max-w-[80%] md:max-w-[70%] ${isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 mt-auto flex-shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10">
                          {otherParticipantName[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="group relative">
                      <div
                        className={`px-4 py-2.5 shadow-sm text-sm break-words leading-relaxed ${isOwn
                          ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white border border-border/50 text-foreground rounded-2xl rounded-tl-sm dark:bg-card"
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      <div
                        className={`flex items-center gap-1 mt-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${isOwn
                          ? "justify-end text-muted-foreground"
                          : "text-muted-foreground"
                          }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-background border-t">
        <div className="flex items-end gap-2 bg-muted/50 p-1.5 rounded-3xl border focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-[40px] px-4 py-2"
          />
          <Button
            onClick={sendMessage}
            disabled={!messageInput.trim() || sending}
            size="icon"
            className={`h-9 w-9 rounded-full shrink-0 mb-0.5 mr-0.5 transition-all ${messageInput.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-muted-foreground/20 text-muted-foreground'
              }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
