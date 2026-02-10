import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      return {
        content: lastMessage.content,
        isOwn: lastMessage.sender_id === user?.id
      };
    }
    return { content: "No messages yet", isOwn: false };
  };

  const filteredConversations = conversations.filter(c =>
    getOtherParticipantName(c).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-white dark:bg-slate-950 border-r-2 border-slate-200 dark:border-slate-800 ${className}`}>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Professional Communications</h2>
          <Badge variant="outline" className="text-xs font-medium bg-slate-50 text-slate-600 border-slate-200">
            {conversations.length} conversations
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all rounded-xl text-sm font-medium text-slate-700 placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-4 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-slate-400">No conversations found</p>
              <p className="text-xs text-slate-500 mt-1">Start a new conversation to see it here</p>
            </div>
          ) : filteredConversations.map((conversation) => {
            const isSelected = selectedConversationId === conversation.id;
            const otherParticipantName = getOtherParticipantName(conversation);
            const { content: lastMessage, isOwn: isOwnMessage } = getLastMessage(conversation);
            const lastMessageTime = conversation.last_message_at
              ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
              : "";

            const isEmergency = !!conversation.emergency_job_id;

            return (
              <div
                key={conversation.id}
                className={`group flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${isSelected
                  ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm"
                  : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30 border-transparent"
                  }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative shrink-0 mt-1">
                  <Avatar className="h-11 w-11 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <AvatarFallback className={`text-sm font-semibold ${isEmergency ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {otherParticipantName[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950 ${isEmergency ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900'}`}>
                      {otherParticipantName}
                    </h4>
                    {lastMessageTime && (
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'}`}>
                        {lastMessageTime.replace('about ', '')}
                      </span>
                    )}
                  </div>

                  <p className={`text-[13px] truncate leading-snug mb-2 ${isSelected ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                    {isOwnMessage && <span className="text-slate-400 font-normal">You: </span>}{lastMessage}
                  </p>

                  {conversation.property_title && (
                    <div className="flex items-center gap-1.5">
                      {isEmergency ? (
                        <Badge variant="destructive" className="h-5 px-2 text-[9px] font-semibold rounded-lg shadow-none">EMERGENCY</Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 px-2 text-[9px] font-medium bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg shadow-none max-w-full truncate">
                          {conversation.property_title.replace('Group Co-buy: ', 'Co-Buy').replace('🚨 Emergency: ', '')}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
