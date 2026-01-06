import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
    <div className={`w-full h-full flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-r border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden ${className}`}>
      {/* Decorative Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="p-8 pb-4 flex-shrink-0 space-y-7 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Inbox</h2>
          <Button variant="ghost" size="icon" className="rounded-[18px] bg-slate-100 dark:bg-slate-800 h-11 w-11 shadow-sm transition-transform active:scale-95">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search conversations..."
              className="pl-12 bg-white dark:bg-slate-850 border-none h-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all text-sm font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 mt-6 relative z-10">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-100/50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] mb-6">
              <MessageCircle className="h-12 w-12 opacity-10" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest opacity-40">Zero Encounters</p>
          </div>
        ) : (
          <div className="space-y-3 pb-12">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const otherParticipantName = getOtherParticipantName(conversation);
              const lastMessage = getLastMessage(conversation);
              const lastMessageTime = conversation.last_message_at
                ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
                : "";

              const isEmergency = !!conversation.emergency_job_id;

              return (
                <div
                  key={conversation.id}
                  className={`group relative flex items-center gap-5 p-4.5 rounded-[24px] cursor-pointer transition-all duration-500 ${isSelected
                    ? "bg-white dark:bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.08)] scale-[1.02] border border-blue-500/5"
                    : "hover:bg-white/70 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-slate-200/20 active:scale-98"
                    }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="relative shrink-0">
                    <div className={`absolute -inset-1 rounded-3xl blur-[8px] opacity-0 transition-opacity duration-500 ${isEmergency ? 'bg-rose-500/20 group-hover:opacity-100' : 'bg-blue-500/10 group-hover:opacity-100'}`} />
                    <Avatar className={`h-16 w-16 relative z-10 border-2 ${isSelected ? 'border-blue-500/10' : 'border-white dark:border-slate-800'} shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <AvatarFallback className={`${isEmergency ? "bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500" : "bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800"} text-white font-black text-xl shadow-inner`}>
                        {otherParticipantName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-5 h-5 ${isEmergency ? 'bg-rose-500' : 'bg-emerald-500'} border-4 border-white dark:border-slate-800 rounded-full shadow-lg z-20 transition-transform group-hover:scale-125`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className={`font-black text-[16px] truncate tracking-tight transition-colors ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900"}`}>
                        {otherParticipantName}
                      </h4>
                      {lastMessageTime && (
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isSelected ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-slate-500"}`}>
                          {lastMessageTime.replace('about ', '')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      {conversation.property_title && (
                        <div className={`text-[10px] font-black uppercase tracking-[0.25em] truncate flex items-center gap-2 ${isEmergency ? 'text-rose-500' : 'text-slate-400 opacity-70 group-hover:opacity-100'}`}>
                          {isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[ping_1.5s_infinite]" />}
                          {conversation.property_title.replace('🚨 Emergency: ', '')}
                        </div>
                      )}
                      <p className={`text-sm truncate max-w-[170px] leading-snug transition-all ${isSelected
                        ? "text-slate-600 dark:text-slate-400 font-semibold"
                        : "text-slate-400 font-medium group-hover:text-slate-500"
                        }`}>
                        {lastMessage}
                      </p>
                    </div>
                  </div>

                  {!isSelected && lastMessage !== "No messages yet" && (
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)] animate-in zoom-in duration-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
