import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

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
      const data = await MessagingService.getConversations();
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

  const filteredConversations = conversations.filter(c =>
    getOtherParticipantName(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="p-4 flex-shrink-0 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight px-1">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Messenger"
            className="pl-9 bg-muted/50 border-none h-10 rounded-full focus-visible:ring-1 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">No conversations found</p>
          </div>
        ) : (
          <div className="px-3 pb-3 space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const otherParticipantName = getOtherParticipantName(conversation);
              const lastMessage = getLastMessage(conversation);
              const lastMessageTime = conversation.last_message_at
                ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
                : "";

              return (
                <div
                  key={conversation.id}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isSelected
                      ? "bg-blue-50/80 dark:bg-blue-900/20"
                      : "hover:bg-muted/60"
                    }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-2 ring-transparent group-hover:ring-muted transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium">
                        {otherParticipantName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Mock online status */}
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`font-semibold text-sm truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`}>
                        {otherParticipantName}
                      </h4>
                      {lastMessageTime && (
                        <span className={`text-[10px] font-medium flex-shrink-0 ${isSelected ? "text-blue-600/70" : "text-muted-foreground/70"}`}>
                          {lastMessageTime.replace('about ', '')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className={`text-xs truncate max-w-[180px] leading-relaxed ${isSelected
                          ? "text-blue-600/80 dark:text-blue-300/80 font-medium"
                          : "text-muted-foreground group-hover:text-foreground/80 font-normal"
                        }`}>
                        {lastMessage}
                      </p>
                    </div>
                  </div>

                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
