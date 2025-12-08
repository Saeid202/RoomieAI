import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Home } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationWithMessages) => void;
  className?: string;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<
    ConversationWithMessages[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();

    // Subscribe to conversation updates
    const subscription = MessagingService.subscribeToConversations(() => {
      loadConversations();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log("Loading conversations...");
      const data = await MessagingService.getConversations();
      console.log("Conversations loaded:", data);
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipantName = (conversation: ConversationWithMessages) => {
    if (user?.id === conversation.landlord_id) {
      return conversation.tenant_name || "Tenant";
    }
    return conversation.landlord_name || "Landlord";
  };

  const getLastMessage = (conversation: ConversationWithMessages) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage =
        conversation.messages[conversation.messages.length - 1];
      return lastMessage.content;
    }
    return "No messages yet";
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversations
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">
                Start by clicking the Message button on a property
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const otherParticipantName =
                  getOtherParticipantName(conversation);
                const lastMessage = getLastMessage(conversation);

                return (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {otherParticipantName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {otherParticipantName}
                        </h4>
                        <Home className="h-3 w-3 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage}
                        </p>
                        {conversation.last_message_at && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatDistanceToNow(
                              new Date(conversation.last_message_at),
                              { addSuffix: true }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
