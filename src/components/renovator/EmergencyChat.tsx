
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MessagingService } from "@/services/messagingService";
import { Message } from "@/types/messaging";
import { useToast } from "@/components/ui/use-toast";

interface EmergencyChatProps {
    jobId: string;
    onClose?: () => void;
}

export function EmergencyChat({ jobId, onClose }: EmergencyChatProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            try {
                // Get job details to find the landlord and assigned renovator
                const { data: job } = await supabase
                    .from('emergency_jobs' as any)
                    .select('landlord_id, assigned_renovator_id')
                    .eq('id', jobId)
                    .single();

                if (!job) throw new Error("Job not found");

                const isLandlord = user.id === (job as any).landlord_id;
                let targetRenovatorUserId = user.id;

                if (isLandlord) {
                    if ((job as any).assigned_renovator_id) {
                        const { data: partner } = await supabase
                            .from('renovation_partners' as any)
                            .select('user_id')
                            .eq('id', (job as any).assigned_renovator_id)
                            .single();

                        if (partner) {
                            targetRenovatorUserId = (partner as any).user_id;
                        }
                    } else {
                        const { data: latestConv } = await supabase
                            .from('conversations' as any)
                            .select('tenant_id')
                            .eq('emergency_job_id', jobId)
                            .order('last_message_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        if (latestConv) {
                            targetRenovatorUserId = (latestConv as any).tenant_id;
                        }
                    }
                }

                const convId = await MessagingService.startEmergencyChat(
                    jobId,
                    (job as any).landlord_id,
                    targetRenovatorUserId
                );
                setConversationId(convId);

                const initialMessages = await MessagingService.getMessages(convId);
                setMessages(initialMessages);
                setLoading(false);

                // Subscribe to real-time messages
                const subscription = MessagingService.subscribeToMessages(convId, (newMsg) => {
                    setMessages((prev) => {
                        if (prev.find(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                });

                return () => subscription.unsubscribe();
            } catch (err: any) {
                console.error("Chat setup error:", err);
                toast({ variant: "destructive", title: "Chat Error", description: err.message });
                setLoading(false);
            }
        };

        setup();
    }, [jobId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !conversationId) return;

        const content = input.trim();
        setInput("");

        try {
            await MessagingService.sendMessage(conversationId, content);
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({ variant: "destructive", title: "Send Error", description: error.message });
        }
    };

    return (
        <div className="flex flex-col h-[450px] bg-white rounded-lg border shadow-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-bold block">Live Support</span>
                        <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Emergency Request Chat</span>
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-slate-800 text-white rounded-full">
                        ✕
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50">
                <div className="space-y-4">
                    {messages.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <div className="bg-white inline-block p-4 rounded-full mb-3 shadow-sm border border-slate-100">
                                <MessageSquare className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-500 max-w-[180px] mx-auto">
                                You are connected with the landlord. Type your message below to begin.
                            </p>
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isOwn = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1.5 font-medium ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
                <Input
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 h-11 text-sm bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
                <Button type="submit" size="icon" className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95">
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    );
}
