import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Phone, Video, Info, ExternalLink, MessageCircle, AlertTriangle, CheckCircle, PlusCircle, Image as LucideImage } from "lucide-react";
import { MessagingService } from "@/services/messagingService";
import { ConversationWithMessages, Message } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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
    <div className={`flex flex-col h-full bg-[#fdfdff] dark:bg-slate-950 overflow-hidden relative ${className}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Glassmorphism Header */}
      <div className="flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-5">
            {onBack && (
              <Button variant="ghost" size="icon" className="md:hidden -ml-2 rounded-xl bg-slate-100 dark:bg-slate-800" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
              <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-800 shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-110">
                <AvatarFallback className={`${isEmergency ? "bg-gradient-to-br from-rose-500 to-orange-500 shadow-inner" : "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-inner"} text-white font-black text-2xl`}>
                  {otherParticipantName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-3 border-white dark:border-slate-900 rounded-full shadow-lg z-20 scale-110" />
            </div>

            <div className="cursor-pointer">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                {otherParticipantName}
                {isEmergency && <Badge className="bg-rose-500 hover:bg-rose-600 animate-pulse border-none text-[10px] h-4">PRIORITY</Badge>}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isEmergency ? 'Emergency Response Team' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Connection Speed</span>
              <span className="text-[10px] font-medium text-slate-400 italic">Ultra-Low Latency</span>
            </div>
            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl h-10 w-10 transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl h-10 w-10 transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl h-10 w-10 transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Context Header - Elevated */}
        {conversation.emergency_job && (
          <div className="px-8 py-3 bg-gradient-to-r from-rose-600/5 via-rose-600/10 to-transparent border-t border-rose-100/50 dark:border-rose-900/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 rounded-xl blur-md opacity-20 animate-pulse" />
                <div className="relative bg-rose-600 p-2.5 rounded-xl shrink-0 shadow-lg shadow-rose-200 dark:shadow-rose-900/40">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em]">Critical Dispatch</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-400 dark:bg-rose-800 animate-bounce" />
                </div>
                <h4 className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate">
                  {conversation.emergency_job.category} • <span className="font-medium text-slate-500">{conversation.emergency_job.unit_address}</span>
                </h4>
              </div>
            </div>
            <Button
              size="sm"
              variant="default"
              className="shrink-0 bg-slate-900 hover:bg-black dark:bg-rose-600 dark:hover:bg-rose-700 text-white shadow-xl h-9 rounded-xl px-5 text-[11px] font-black uppercase tracking-widest gap-2 transition-all hover:-translate-y-0.5"
              onClick={() => {
                if (!conversation) return;
                const isLandlord = user?.id === conversation.landlord_id;
                const path = isLandlord
                  ? `/dashboard/emergency/${conversation.emergency_job_id}`
                  : `/renovator/jobs/${conversation.emergency_job_id}`;
                navigate(path);
              }}
            >
              Enter Assesment Center
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area with Mesh Theme */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="px-6 py-12 max-w-5xl mx-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="relative mb-10">
                <div className="absolute -inset-10 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border shadow-2xl relative">
                  <Avatar className="h-28 w-28 overflow-hidden">
                    <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
                      {otherParticipantName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Wave hello to {otherParticipantName}!</h4>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xs font-medium opacity-70">The best way to start is with a simple 'Hi'.</p>
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
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${isLastInGroup ? 'mb-4' : 'mb-1'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex gap-4 max-w-[85%] sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {!isOwn && (
                        <div className="w-10 shrink-0 flex items-end">
                          {isLastInGroup ? (
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-md ring-4 ring-slate-50 dark:ring-slate-900">
                              <AvatarFallback className="text-xs font-black bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                                {otherParticipantName[0]}
                              </AvatarFallback>
                            </Avatar>
                          ) : <div className="w-10" />}
                        </div>
                      )}

                      <div className={`group relative flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-6 py-4 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.07)] text-[15px] leading-relaxed relative transition-all duration-300 ${isOwn
                            ? `bg-blue-600 bg-gradient-to-br from-blue-600 to-indigo-700 text-white ${isFirstInGroup ? 'rounded-t-[1.5rem] rounded-l-[1.5rem]' : 'rounded-l-[1.5rem]'} ${isLastInGroup ? 'rounded-b-[1.5rem]' : 'rounded-l-[1.5rem]'}`
                            : `bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 ${isFirstInGroup ? 'rounded-t-[1.5rem] rounded-r-[1.5rem]' : 'rounded-r-[1.5rem]'} ${isLastInGroup ? 'rounded-b-[1.5rem]' : 'rounded-r-[1.5rem]'}`
                            }`}
                        >
                          <p className="whitespace-pre-wrap font-medium selection:bg-white/30">{message.content}</p>
                        </div>

                        {isLastInGroup && (
                          <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ${isOwn ? 'mr-1' : 'ml-1'}`}>
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: false }).replace('about ', '')} ago
                            </span>
                            {isOwn && <CheckCircle className="h-3 w-3 text-emerald-400" />}
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

      {/* Action Pill - High-Fidelity Floating UI */}
      <div className="px-10 pb-12 pt-6 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 z-20">
        <div className="max-w-4xl mx-auto relative">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-blue-500/5 rounded-[40px] blur-2xl pointer-events-none" />

          <div className="relative group/input">
            {/* Dynamic Border Gradient */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-slate-200 via-blue-500/20 to-slate-200 dark:from-slate-800 dark:via-blue-500/30 dark:to-slate-800 rounded-[30px] group-focus-within/input:from-blue-500 group-focus-within/input:via-indigo-500 group-focus-within/input:to-purple-600 transition-all duration-700" />

            <div className="relative flex items-center gap-3 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[29px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-none transition-all duration-300">
              <div className="flex gap-2 ml-2">
                <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
                  <PlusCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex h-11 w-11 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
                  <LucideImage className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 px-2">
                <textarea
                  placeholder="Message..."
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
                  className="w-full bg-transparent border-none focus:ring-0 text-[16px] font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3.5 resize-none max-h-32 min-h-[48px] placeholder:font-medium tracking-tight"
                  style={{ height: 'auto' }}
                />
              </div>

              <div className="flex items-center pr-1.5">
                {messageInput.trim() ? (
                  <Button
                    onClick={sendMessage}
                    disabled={sending}
                    className="h-11 w-11 rounded-full p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-500 animate-in zoom-in slide-in-from-right-2"
                  >
                    {sending ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 -mr-0.5" />
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 pr-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 rounded-full cursor-default opacity-50">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity">
              <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] cursor-default leading-none">
                Protocol Secured
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
