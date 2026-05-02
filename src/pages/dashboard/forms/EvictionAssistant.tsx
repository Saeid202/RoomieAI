import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Send, Bot, User, DoorOpen, CalendarClock, CheckSquare,
    FileText, AlertTriangle, ShieldAlert, Loader2, Copy, Check,
    Banknote, Clock, Wrench, Volume2, Home, HardHat, UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

interface EvictionReasonExtended {
    id: string;
    label: string;
    form: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
}

const evictionReasons: EvictionReasonExtended[] = [
    { id: "n4", label: "Non-payment of Rent", form: "N4", description: "Tenant has not paid rent on time", icon: Banknote, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { id: "persistent-late", label: "Persistent Late Payment", form: "N8", description: "Tenant is frequently late paying rent", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { id: "damage", label: "Damage to Property", form: "N5", description: "Tenant has caused undue damage", icon: Wrench, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
    { id: "interference", label: "Interference / Disturbance", form: "N5", description: "Tenant is disturbing others or landlord", icon: Volume2, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { id: "landlord-use", label: "Landlord's Own Use", form: "N12", description: "You or a family member moving in", icon: Home, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { id: "renovation", label: "Renovation or Repair", form: "N13", description: "Extensive repairs requiring vacancy", icon: HardHat, color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200" },
    { id: "unauthorized", label: "Unauthorized Occupant", form: "A2", description: "Occupant residing without permission", icon: UserX, color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
];

const FormattedMessage = ({ content }: { content: string }) => {
    const paragraphs = content.split("\n");
    return (
        <div className="space-y-1.5">
            {paragraphs.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />;
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className={`leading-relaxed ${line.trim().startsWith("-") || line.trim().match(/^\d+\./) ? "pl-4" : ""}`}>
                        {parts.map((part, j) =>
                            part.startsWith("**") && part.endsWith("**")
                                ? <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                                : <span key={j}>{part}</span>
                        )}
                    </p>
                );
            })}
        </div>
    );
};

export default function EvictionAssistantPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [selectedReason, setSelectedReason] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (messages.length === 0) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const currentReason = evictionReasons.find(r => r.id === selectedReason);

    const handleReasonSelect = (reasonId: string) => {
        setSelectedReason(reasonId);
        const reason = evictionReasons.find(r => r.id === reasonId);
        if (reason) {
            setInputValue(`I need help with an eviction for ${reason.label} (${reason.form}). What are the first steps and timeline?`);
            textareaRef.current?.focus();
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        const userMessage: Message = { id: Date.now().toString(), content: inputValue.trim(), role: "user", timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue.trim();
        setInputValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/deepseek-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: `You are an AI Eviction Assistant specialized in Ontario's Residential Tenancies Act and LTB procedures. Guide landlords step-by-step. Selected reason: "${selectedReason}". Always state this is informational, not legal advice.` },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: currentInput }
                    ],
                    temperature: 0.5, max_tokens: 1000
                }),
                signal: AbortSignal.timeout(30000)
            });
            if (!response.ok) throw new Error("API failed");
            const data = await response.json();
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: data.choices?.[0]?.message?.content || "Error generating response.", role: "assistant", timestamp: new Date() }]);
        } catch {
            const cr = evictionReasons.find(r => r.id === selectedReason);
            const label = cr?.label || "Non-payment of Rent";
            const form = cr?.form || "N4";
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: `**Offline Mode:** General steps for **${label}** (${form}):\n1. Serve **${form}** Notice.\n2. Wait for the notice period to expire.\n3. If unresolved, file application with LTB.\n4. Wait for Hearing.\n\n*Disclaimer: Not legal advice.*`,
                role: "assistant", timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            toast({ title: "Copied!", description: "Message copied." });
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to copy." });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-130px)] -mx-6">

            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                        <DoorOpen className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Eviction Assistant (Ontario)</h1>
                        <p className="text-xs text-gray-500">Step-by-step guidance to navigate Ontario eviction rules correctly</p>
                    </div>
                </div>
            </div>

            {/* Case type selector */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Select Eviction Case Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    {evictionReasons.map(reason => {
                        const Icon = reason.icon;
                        const isSelected = selectedReason === reason.id;
                        return (
                            <button
                                key={reason.id}
                                onClick={() => handleReasonSelect(reason.id)}
                                className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                                    isSelected
                                        ? `${reason.bgColor} ${reason.borderColor} shadow-md -translate-y-0.5`
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                                    isSelected ? `${reason.bgColor} ${reason.color}` : `bg-gray-100 text-gray-500 group-hover:${reason.bgColor} group-hover:${reason.color}`
                                }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold leading-tight ${isSelected ? reason.color : "text-gray-700"}`}>
                                        {reason.label}
                                    </p>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                                        isSelected ? `${reason.color} ${reason.bgColor}` : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {reason.form}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${reason.color.replace("text-", "bg-")}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">

                {/* Chat column */}
                <div className="flex flex-col flex-1 min-w-0">

                    {/* Messages */}
                    <div className="flex-1 px-6 py-6 min-h-[400px]">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full pb-16">
                                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                                    <ShieldAlert className="h-7 w-7 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Eviction Assistant</h2>
                                <p className="text-gray-500 text-center max-w-md">
                                    Select a case type above to initialize the workflow, or describe your situation below for AI-guided legal information.
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto space-y-6">
                                {messages.map(message => (
                                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        {message.role === "assistant" && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 flex-shrink-0 text-red-600" />
                                            </div>
                                        )}
                                        <div className="max-w-[78%]">
                                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-gray-100/80 border border-gray-200 text-gray-900 rounded-bl-sm"}`}>
                                                <FormattedMessage content={message.content} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 px-1">
                                                <span className="text-xs text-gray-400">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                {message.role === "assistant" && (
                                                    <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={() => copyToClipboard(message.content, message.id)}>
                                                        {copiedMessageId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {message.role === "user" && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                                                <User className="h-4 w-4 flex-shrink-0 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="min-h-[60px]">
                                    {isLoading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 flex-shrink-0 text-red-600" />
                                            </div>
                                            <div className="bg-gray-100/80 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                                    <span className="text-sm text-gray-500">Processing legal requirements...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input bar */}
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="flex gap-3 items-end bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
                                <Textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your question or situation here..."
                                    disabled={isLoading}
                                    rows={1}
                                    className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-gray-900 placeholder:text-gray-400 min-h-[44px] max-h-[160px] py-2 text-sm"
                                    onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }}
                                />
                                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon" className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 rounded-xl h-10 w-10">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-2">AI provides general guidance only. Consult a legal professional for official advice.</p>
                        </div>
                    </div>
                </div>

                {/* Right sidebar — Eviction Toolkit */}
                <div className="w-72 flex-shrink-0 border-l border-gray-200 px-4 py-6 space-y-4 overflow-y-auto">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="overview">Toolkit</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-3 mt-3">
                            {/* Next Best Action */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                        <CheckSquare className="h-3.5 w-3.5 flex-shrink-0" /> Next Best Action
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                    {currentReason ? (
                                        <div className="space-y-2">
                                            <p className="font-semibold text-blue-700">Prepare Form {currentReason.form}</p>
                                            <p className="text-xs text-gray-500">Review lease and payment records before serving.</p>
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 gap-2 text-xs"
                                                onClick={() => navigate(`/dashboard/forms/${currentReason.form.toLowerCase()}`)}>
                                                <FileText className="h-3.5 w-3.5 flex-shrink-0" /> Start {currentReason.form} Form
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Select a case type above.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Required Forms */}
                            <Card>
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 flex-shrink-0" /> Required Forms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-xs space-y-1">
                                    {currentReason ? (
                                        <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                            <li><strong>{currentReason.form}</strong> Notice to End Tenancy</li>
                                            <li>{currentReason.description}</li>
                                            <li>Certificate of Service</li>
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 italic">Waiting for selection...</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Mistakes to Avoid */}
                            <Card className="bg-red-50/50 border-red-100">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-semibold uppercase text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> Mistakes to Avoid
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-xs">
                                    <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                        <li>Don't use email unless consent is in writing.</li>
                                        <li>Don't count the day of service in the notice period.</li>
                                        <li>Ensure all tenant names match the lease exactly.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="timeline" className="mt-3">
                            <Card>
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-2">
                                        <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" /> Estimated Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                    {currentReason ? (
                                        <div className="relative border-l-2 border-gray-200 ml-2 pl-4 py-1 space-y-5">
                                            {[
                                                { label: "Today", desc: `Prepare ${currentReason.form} Notice`, color: "bg-blue-500" },
                                                { label: "Notice Period", desc: "Wait approx. 14–60 days", color: "bg-gray-300" },
                                                { label: "File Application", desc: "Earliest filing if unresolved", color: "bg-gray-300" },
                                                { label: "Hearing", desc: "Est. 4–8 months wait", color: "bg-gray-300" },
                                            ].map((step, i) => (
                                                <div key={i} className="relative">
                                                    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ${step.color}`} />
                                                    <p className="text-xs font-semibold text-gray-900">{step.label}</p>
                                                    <p className="text-xs text-gray-500">{step.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400">
                                            <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">Select a case type to generate a timeline.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2 items-start">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800">Timelines are estimates only. LTB delays typically range 4–8 months. Not legal advice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
