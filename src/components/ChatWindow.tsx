import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Phone, Video, Info, ExternalLink, MessageCircle, AlertTriangle, CheckCircle, PlusCircle, Image as LucideImage, ShieldCheck } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages, Message } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ChatInfoPanel } from "./ChatInfoPanel";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showInfoPanel, setShowInfoPanel] = useState(true);
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
      setTimeout(() => scrollToBottom(), 100);
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
  const otherParticipantId = conversation ? (user?.id === conversation.landlord_id ? conversation.tenant_id : conversation.landlord_id) : "";


  if (!conversation) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc] dark:bg-slate-950 text-center relative overflow-hidden ${className}`}>
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative group mb-8">
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700" />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-slate-800/40">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl">
              <MessageCircle className="w-20 h-20 text-blue-600/60" strokeWidth={1} />
            </div>
          </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Your Universe</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg font-medium leading-relaxed opacity-80">
          Connect with roommates, landlords, and pros in a dynamic, secure workspace.
        </p>
      </div>
    );
  }

  const isEmergency = !!conversation.emergency_job_id;

  return (
    <div className={`flex h-full bg-[#fdfdff] dark:bg-slate-950 overflow-hidden relative ${className}`}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-0 border-r-4 border-slate-300 dark:border-slate-800">
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Glassmorphism Header */}
        <div className="flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b-2 border-slate-200 dark:border-slate-800 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 rounded-xl" onClick={onBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}

              <div className="relative group cursor-pointer" onClick={() => setShowInfoPanel(true)}>
                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-lg relative z-10">
                  <AvatarFallback className={`${isEmergency ? "bg-gradient-to-br from-rose-500 to-orange-500" : "bg-gradient-to-br from-blue-600 to-indigo-700"} text-white font-bold text-lg`}>
                    {otherParticipantName[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow z-20" />
              </div>

              <div className="cursor-pointer" onClick={() => setShowInfoPanel(true)}>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  {otherParticipantName}
                  {isEmergency && <Badge className="bg-rose-500 hover:bg-rose-600 animate-pulse border-none text-[10px] h-5 px-1.5">URGENT</Badge>}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isEmergency ? 'Emergency Response' : 'Online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-600 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-white rounded-full h-10 w-10 shadow-sm transition-all">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-white rounded-full h-10 w-10 shadow-sm transition-all">
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-10 w-10 border shadow-sm transition-all ${showInfoPanel ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-white'}`}
                onClick={() => setShowInfoPanel(!showInfoPanel)}
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Emergency Banner */}
          {conversation.emergency_job && (
            <div className="px-6 py-2 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/40 rounded-lg text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                  {conversation.emergency_job.category} • {conversation.emergency_job.unit_address}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                onClick={() => {
                  const isLandlord = user?.id === conversation.landlord_id;
                  const path = isLandlord
                    ? `/dashboard/emergency/${conversation.emergency_job_id}`
                    : `/renovator/jobs/${conversation.emergency_job_id}`;
                  navigate(path);
                }}
              >
                View Job
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 sm:px-6 md:px-10" ref={scrollAreaRef}>
          <div className="py-8 max-w-4xl mx-auto w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <Avatar className="h-20 w-20 mb-6">
                  <AvatarFallback className="text-2xl bg-slate-100 text-slate-400">
                    {otherParticipantName[0]}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Say hello to {otherParticipantName}</h4>
                <p className="text-slate-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const isFirstInGroup = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                  const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender_id !== message.sender_id;

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${isLastInGroup ? 'mb-4' : 'mb-1'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        {!isOwn && (
                          <div className="w-8 shrink-0 flex items-end">
                            {isLastInGroup ? (
                              <Avatar className="h-8 w-8 shadow-sm">
                                <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {otherParticipantName[0]}
                                </AvatarFallback>
                              </Avatar>
                            ) : <div className="w-8" />}
                          </div>
                        )}

                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-5 py-3 text-[15px] shadow-sm relative transition-all duration-300 ${isOwn
                              ? `bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none ${isFirstInGroup ? 'rounded-t-[20px] rounded-l-[20px]' : 'rounded-l-[20px]'} ${isLastInGroup ? 'rounded-b-[20px]' : 'rounded-l-[20px]'}`
                              : `bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 ${isFirstInGroup ? 'rounded-t-[20px] rounded-r-[20px]' : 'rounded-r-[20px]'} ${isLastInGroup ? 'rounded-b-[20px]' : 'rounded-r-[20px]'}`
                              }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          </div>

                          {isLastInGroup && (
                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: false }).replace('about ', '')}
                              </span>
                              {isOwn && <CheckCircle className="h-3 w-3 text-blue-600" />}
                            </div>
                          )}
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

        {/* Composer */}
        <div className="px-6 py-6 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm relative z-20">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-[28px] p-2.5 shadow-xl shadow-slate-200/40 dark:shadow-none transition-shadow duration-300 focus-within:shadow-2xl focus-within:shadow-blue-900/5 focus-within:border-blue-400">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full text-slate-500 bg-slate-100 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shrink-0 transition-all">
              <PlusCircle className="h-6 w-6" />
            </Button>

            <textarea
              placeholder="Type a message..."
              rows={1}
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                  e.currentTarget.style.height = 'auto';
                }
              }}
              disabled={sending}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 py-3 min-h-[44px] max-h-32 resize-none leading-relaxed font-medium"
              style={{ height: 'auto' }}
            />

            <Button
              onClick={sendMessage}
              disabled={sending || !messageInput.trim()}
              className={`h-11 w-11 rounded-full shrink-0 transition-all duration-300 ${messageInput.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 scale-100' : 'bg-slate-200 text-slate-400 shadow-none scale-95'}`}
            >
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
          <div className="text-center mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3 w-3" /> Secure & Private
            </p>
          </div>
        </div>
      </div>

      {/* Info Panel Side */}
      {showInfoPanel && conversation && (
        <ChatInfoPanel
          userId={otherParticipantId}
          userName={otherParticipantName}
          role={user?.id === conversation.landlord_id ? 'tenant' : 'landlord'}
          onClose={() => setShowInfoPanel(false)}
          className="hidden lg:flex shrink-0 z-30 shadow-xl"
        />
      )}
    </div>
  );
}
