import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Send, Bot, User, Home, Flame, ClipboardList, MapPin,
    CheckCircle, Loader2, Copy, Check, Building, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

interface ComplianceTopic {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const complianceTopics: ComplianceTopic[] = [
    { id: "basement-secondary", title: "Basement & Secondary Units", description: "Requirements for legal secondary suites", icon: <Home className="h-4 w-4" />, color: "text-blue-600 bg-blue-100" },
    { id: "fire-safety", title: "Fire & Safety Codes", description: "Smoke alarms, exits, and fire separation", icon: <Flame className="h-4 w-4" />, color: "text-red-600 bg-red-100" },
    { id: "permits-renovations", title: "Permits & Renovations", description: "When you need a permit and how to apply", icon: <ClipboardList className="h-4 w-4" />, color: "text-yellow-600 bg-yellow-100" },
    { id: "occupancy-zoning", title: "Occupancy & Zoning", description: "Permitted uses and occupancy limits", icon: <MapPin className="h-4 w-4" />, color: "text-purple-600 bg-purple-100" },
    { id: "inspection-readiness", title: "Inspection Readiness", description: "Prepare for municipal inspections", icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600 bg-green-100" },
];

export default function PropertyCompliancePage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (messages.length === 0) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const generateAIResponse = (userInput: string): string => {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes("basement") || lowerInput.includes("secondary") || lowerInput.includes("suite")) {
            return `For legal secondary suites in Ontario:\n\n**Key Requirements:**\n- Ceiling Height: Minimum 1.95m over 50% of floor area\n- Egress: Direct exit or shared exit with fire separation\n- Windows: Minimum size for emergency escape in every bedroom\n- Fire Separation: 45-minute fire rating between units\n- Sound Transmission: Minimum STC rating of 50\n\n**Next Steps:**\n- Check local municipal zoning bylaws\n- Apply for a building permit before construction\n- Arrange ESA electrical inspection\n\nWould you like a checklist for a specific municipality?`;
        }
        if (lowerInput.includes("fire") || lowerInput.includes("alarm") || lowerInput.includes("smoke")) {
            return `Ontario Fire Code compliance essentials:\n\n**Safety Devices:**\n- Smoke Alarms: Required on every level and outside sleeping areas\n- CO Alarms: Required adjacent to sleeping areas if fuel-burning appliance present\n- Fire Extinguishers: Recommended in kitchens and mechanical rooms\n\n**Structural Safety:**\n- Fire Separation: Walls/floors between units must have fire-resistance ratings\n- Means of Egress: Clear, unobstructed paths to exits\n- Fire Doors: Self-closing doors with proper latches\n\nDo you have specific questions about retrofitting an older property?`;
        }
        if (lowerInput.includes("permit") || lowerInput.includes("renovation")) {
            return `A Building Permit is generally required for:\n\n- Finishing a basement or creating a secondary suite\n- Structural changes (removing walls, new windows/doors)\n- New additions or garages\n- Major plumbing or HVAC work\n- Decks higher than 24 inches above ground\n\n**No permit typically needed for:**\n- Replacing kitchen cabinets (without plumbing changes)\n- Painting, flooring, or minor cosmetic repairs\n- Replacing a roof (no structural changes)\n\n**Risk:** Renovating without a permit can lead to double permit fees or having to uncover/remove work.\n\nAre you planning a specific renovation?`;
        }
        return `Thank you for asking about property compliance. I can help with:\n\n- Ontario Building Code requirements\n- Fire Code safety checklists\n- Secondary suite legalization\n- Permit application processes\n- Inspection preparation guidelines\n\n**Note:** This is for preventive compliance planning. Always consult your local building department for final approvals.\n\nWhat specific compliance topic are you working on?`;
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
                        { role: "system", content: "You are an AI assistant specialized in Ontario property compliance, building codes, and safety regulations for landlords. Provide clear, accurate advice. Always include a disclaimer that this is for information purposes only." },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: currentInput }
                    ],
                    temperature: 0.7, max_tokens: 800
                }),
                signal: AbortSignal.timeout(30000)
            });
            if (!response.ok) throw new Error("API failed");
            const data = await response.json();
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: data.choices?.[0]?.message?.content || "Error generating response.", role: "assistant", timestamp: new Date() }]);
        } catch {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: generateAIResponse(currentInput), role: "assistant", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTopicClick = (topic: ComplianceTopic) => {
        setInputValue(`I'd like to check compliance for ${topic.title.toLowerCase()}. ${topic.description}`);
        textareaRef.current?.focus();
    };

    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            toast({ title: "Copied!", description: "Message copied to clipboard." });
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
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Property Compliance AI (Ontario)</h1>
                        <p className="text-xs text-gray-500">Verify your property against Ontario building, safety, and zoning regulations</p>
                    </div>
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
                                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                                    <Building className="h-7 w-7 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Compliance Assistant</h2>
                                <p className="text-gray-500 text-center max-w-md">
                                    Ask about building codes, permits, fire safety, or inspection readiness for your Ontario property.
                                </p>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto space-y-6">
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        {message.role === "assistant" && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                            </div>
                                        )}
                                        <div className="max-w-[78%]">
                                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${message.role === "user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-gray-100/80 border border-gray-200 text-gray-900 rounded-bl-sm"}`}>
                                                {message.content}
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
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Bot className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                            </div>
                                            <div className="bg-gray-100/80 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                    <span className="text-sm text-gray-500">Checking regulations...</span>
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
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about building codes, permits, inspections, or property compliance…"
                                    disabled={isLoading}
                                    rows={1}
                                    className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-gray-900 placeholder:text-gray-400 min-h-[44px] max-h-[160px] py-2 text-sm"
                                    onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }}
                                />
                                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon" className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 rounded-xl h-10 w-10">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-2">General guidance only — consult your local building department for official approvals.</p>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-72 flex-shrink-0 border-l border-gray-200 px-4 py-6 space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Compliance Topics</h2>
                        <div className="space-y-2">
                            {complianceTopics.map((topic) => (
                                <button key={topic.id} onClick={() => handleTopicClick(topic)} className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-100/80 border border-gray-200 hover:bg-gray-200/60 transition-colors text-left">
                                    <span className={`p-1.5 rounded-lg flex-shrink-0 ${topic.color}`}>{topic.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{topic.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Pro Tip</h2>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>• Always keep digital copies of permits and inspection reports</p>
                            <p>• Regular self-inspections can save thousands in fines</p>
                            <p>• Check municipal bylaws before starting any renovation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
