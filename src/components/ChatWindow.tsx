import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, ArrowLeft } from "lucide-react";
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

  if (!conversation) {
    return (
      <Card className={`flex-1 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">Select a conversation</p>
            <p className="text-sm">
              Choose a conversation from the list on the right to start
              messaging
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full overflow-hidden ${className}`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex-1">
            <CardTitle className="text-base">
              Chat with {getOtherParticipantName()}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Property: {conversation.property_title || "Unknown Property"}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator className="flex-shrink-0" />

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden min-h-0">
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 max-w-[80%] ${
                        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 text-xs ${
                            isOwn
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span>
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </span>
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

        <Separator className="flex-shrink-0" />

        <div className="p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!messageInput.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
