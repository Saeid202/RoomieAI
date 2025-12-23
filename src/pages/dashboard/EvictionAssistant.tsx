
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Send,
    Bot,
    User,
    DoorOpen,
    CalendarClock,
    CheckSquare,
    FileText,
    AlertTriangle,
    ArrowRight,
    ShieldAlert,
    Loader2,
    Copy,
    Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isTyping?: boolean;
}

interface EvictionReason {
    id: string;
    label: string;
    form: string;
    description: string;
}

const evictionReasons: EvictionReason[] = [
    { id: 'n4', label: 'Non-payment of Rent', form: 'N4', description: 'Tenant has not paid rent on time' },
    { id: 'persistent-late', label: 'Persistent Late Payment', form: 'N8', description: 'Tenant is frequently late paying rent' },
    { id: 'damage', label: 'Damage to Property', form: 'N5', description: 'Tenant has caused undue damage' },
    { id: 'interference', label: 'Interference / Disturbance', form: 'N5', description: 'Tenant is disturbing others or landlord' },
    { id: 'landlord-use', label: 'Landlord\'s Own Use', form: 'N12', description: 'You or a family member moving in' },
    { id: 'renovation', label: 'Renovation or Repair', form: 'N13', description: ' extensive repairs requiring vacancy' },
    { id: 'unauthorized', label: 'Unauthorized Occupant', form: 'A2', description: 'Occupant residing without permission' },
];

const FormattedMessage = ({ content }: { content: string }) => {
    // Split by newlines to handle paragraphs
    const paragraphs = content.split('\n');

    return (
        <div className="space-y-1.5">
            {paragraphs.map((line, i) => {
                if (!line.trim()) {
                    return <div key={i} className="h-2" />; // Spacer for empty lines
                }

                // Parse bold syntax (**text**)
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className={`leading-relaxed ${line.trim().startsWith('-') || line.trim().match(/^\d+\./) ? 'pl-4' : ''}`}>
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleReasonSelect = (reasonId: string) => {
        setSelectedReason(reasonId);
        const reason = evictionReasons.find(r => r.id === reasonId);
        if (reason) {
            const initialMessage = `I need help with an eviction for **${reason.label}** (${reason.form}). What are the first steps and timeline?`;
            setInputValue(initialMessage);
            // Optional: Auto-send or just populate? Let's populate for user to confirm or add details.
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue.trim();
        setInputValue("");
        setIsLoading(true);

        try {
            const conversationMessages = [
                {
                    role: 'system',
                    content: `You are an AI Eviction Assistant specialized in Ontario's Residential Tenancies Act (RTA) and Landlord and Tenant Board (LTB) procedures. 
      Your goal is to guide landlords through eviction processes correctly to avoid delays and dismissals.
      
      Context: The user has selected the eviction reason ID: "${selectedReason}" (if applicable).
      
      Provide procedural, step-by-step guidance.
      For the selected eviction type, outline:
      1. The correct Notice form to use (e.g., N4, N5, N12).
      2. The notice period (e.g., 14 days, 60 days).
      3. Service methods (hand delivery, mailbox - avoid prohibited methods like email unless agreed).
      4. When to file (e.g., L1, L2 applications) if the issue isn't resolved.
      
      If asked for a timeline, provide ESTIMATES for:
      - Notice period
      - Filing wait time
      - Approximate hearing wait (e.g., 4-8 months currently in Ontario, but varies).
      
      Disclaimer: Always state this is informational and not legal advice.`
                },
                ...messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: 'user',
                    content: currentInput
                }
            ];

            // Assuming we use the same local proxy as other AI pages
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch('http://localhost:3001/api/deepseek-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: conversationMessages,
                    temperature: 0.5, // Lower temperature for more deterministic/procedural answers
                    max_tokens: 1000
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API request failed`);
            }

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || 'Error generating response.';

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: aiResponse,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error calling API:', error);
            toast({
                variant: "destructive",
                title: "Connection Error",
                description: "Could not connect to Eviction Assistant. Using offline mode."
            });

            // Fallback response
            const currentReasonLabel = currentReason ? currentReason.label : "Non-payment of Rent";
            const currentReasonForm = currentReason ? currentReason.form : "N4";

            const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `**Offline Mode:** I see you're asking about eviction. Please ensure your backend is running to get real-time legal guidance.\n\nGeneral steps for **${currentReasonLabel}** (${currentReasonForm}):\n1. Serve **${currentReasonForm} Response** Notice.\n2. Wait for the notice period to expire.\n3. If unresolved, file application with LTB.\n4. Wait for Hearing.\n\n*Disclaimer: Not legal advice.*`,
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, fallbackMessage]);
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Helper to get current selected reason details
    const currentReason = evictionReasons.find(r => r.id === selectedReason);

    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <DoorOpen className="h-8 w-8 text-red-600" />
                    Eviction Assistant (Ontario)
                </h1>
                <p className="text-muted-foreground">
                    Step-by-step guidance to help landlords navigate Ontario eviction rules correctly and avoid costly mistakes.
                </p>
            </div>

            {/* Case Type Selector */}
            <Card className="mb-6 border-l-4 border-l-roomie-purple shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Select Eviction Case Type</CardTitle>
                    <CardDescription>Choose the primary reason for eviction to initialize the assistant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {evictionReasons.map((reason) => (
                            <Button
                                key={reason.id}
                                variant={selectedReason === reason.id ? "default" : "outline"}
                                onClick={() => handleReasonSelect(reason.id)}
                                className={`rounded-full shadow-sm transition-all ${selectedReason === reason.id ? 'bg-slate-900 hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                            >
                                {reason.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Chat Interface */}
                <div className="lg:col-span-8">
                    <Card className="h-[calc(100vh-18rem)] flex flex-col shadow-md overflow-hidden bg-white border border-slate-200">
                        <CardHeader className="pb-4 bg-white border-b border-slate-100 z-10">
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <Bot className="h-5 w-5 text-slate-500" />
                                AI Eviction Guide
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0 relative">
                            {/* Chat messages area with subtle background */}
                            <div className="flex-1 overflow-y-auto space-y-6 p-4 bg-slate-50 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-16 px-6">
                                        <div className="bg-white rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-slate-200 shadow-sm">
                                            <ShieldAlert className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="font-semibold text-xl text-slate-800 mb-2">Eviction Assistant</h3>
                                        <p className="max-w-md mx-auto text-slate-500 leading-relaxed">
                                            Select a case type above to initialize the workflow, or describe your situation below for AI-guided legal information.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-3 max-w-[90%] lg:max-w-[85%] min-w-0 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${message.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200'
                                                    }`}>
                                                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div className={`rounded-xl p-4 text-sm shadow-sm break-words overflow-hidden ${message.role === 'user'
                                                    ? 'bg-slate-800 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-800'
                                                    }`}>
                                                    <FormattedMessage content={message.content} />
                                                    {message.role === 'assistant' && (
                                                        <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-100">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 gap-1.5 text-xs text-slate-400 hover:text-slate-700 px-2"
                                                                onClick={() => copyToClipboard(message.content, message.id)}
                                                            >
                                                                {copiedMessageId === message.id ? (
                                                                    <>
                                                                        <Check className="h-3 w-3 text-green-600" />
                                                                        <span className="text-green-600">Copied</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-3 w-3" />
                                                                        <span>Copy</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && (
                                    <div className="flex gap-4 justify-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-slate-600 border border-slate-200 flex items-center justify-center shadow-sm">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                                <span className="text-sm font-medium text-slate-500">Processing legal requirements...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Professional Input Area - Fixed at bottom */}
                            <div className="p-4 bg-white border-t border-slate-100 z-10">
                                <div className="relative flex items-end gap-2 bg-white border border-slate-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-400 transition-all p-2">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your question or situation here..."
                                        disabled={isLoading}
                                        className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent min-h-[44px] py-3 px-2 text-base"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="mb-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed px-4 h-10"
                                    >
                                        <span className="mr-2 font-medium">Send</span>
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <div className="text-[10px] text-center text-slate-400 mt-2">
                                    AI provides general guidance only. Consult a legal professional for official advice.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Eviction Toolkit */}
                <div className="lg:col-span-4 space-y-4">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="overview">Toolkit</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid gap-4">
                                {/* Next Best Action Card */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                            <CheckSquare className="h-4 w-4" /> Next Best Action
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3">
                                        {currentReason ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="font-semibold text-lg text-blue-700">Prepare Form {currentReason.form}</div>
                                                    <p className="text-sm text-gray-600">Review lease and payment records before serving.</p>
                                                </div>
                                                {currentReason.id === 'damage' || currentReason.id === 'interference' || currentReason.form === 'N5' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/n5')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Form
                                                    </Button>
                                                ) : currentReason.id === 'persistent-late' || currentReason.form === 'N8' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/n8')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Form
                                                    </Button>
                                                ) : currentReason.id === 'n4' || currentReason.form === 'N4' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/n4')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Form
                                                    </Button>
                                                ) : currentReason.id === 'landlord-use' || currentReason.form === 'N12' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/n12')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Form
                                                    </Button>
                                                ) : currentReason.id === 'renovation' || currentReason.form === 'N13' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/n13')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Form
                                                    </Button>
                                                ) : currentReason.form === 'A2' ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                                                        onClick={() => navigate('/dashboard/forms/a2')}
                                                    >
                                                        <FileText className="h-4 w-4" /> Start {currentReason.form} Application
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" className="w-full gap-2" disabled>
                                                        <FileText className="h-4 w-4" /> Form Builder Coming Soon
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Select a case type to see recommended actions.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Required Notices */}
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Required Forms
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3 text-sm space-y-2">
                                        {currentReason ? (
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li><strong>{currentReason.form}</strong> Notice to End Tenancy</li>
                                                <li>Reference: {currentReason.description}</li>
                                                <li>Certificate of Service (to prove you delivered it)</li>
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic">Waiting for selection...</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Mistakes to Avoid */}
                                <Card className="bg-red-50/50 border-red-100">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-sm font-medium uppercase text-red-600 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" /> Mistakes to Avoid
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-3 text-sm space-y-2">
                                        <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                            <li>Don't use email unless consent is in writing.</li>
                                            <li>Don't count the day of service in the notice period.</li>
                                            <li>Ensure all tenant names match the lease exactly.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="timeline">
                            <Card>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" /> Estimated Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-3 space-y-4">
                                    {currentReason ? (
                                        <div className="relative border-l-2 border-gray-200 ml-2 pl-4 py-1 space-y-6">
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                                <h4 className="text-sm font-semibold">Today</h4>
                                                <p className="text-xs text-gray-500">Prepare {currentReason.form} Notice</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300"></div>
                                                <h4 className="text-sm font-semibold">Notice Period</h4>
                                                <p className="text-xs text-gray-500">Wait approx. 14-60 days (varies by reason)</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300"></div>
                                                <h4 className="text-sm font-semibold">File Application</h4>
                                                <p className="text-xs text-gray-500">Earliest filing date if unresolved</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300"></div>
                                                <h4 className="text-sm font-semibold">Hearing</h4>
                                                <p className="text-xs text-gray-500">Est. 4-8 months wait</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Select a case type to generate a timeline estimate.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Warning Footer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 items-start mt-4">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                            <strong>Disclaimer:</strong> Timelines are estimates only. LTB delays typically range from 4 to 8 months. This tool does not provide legal advice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
