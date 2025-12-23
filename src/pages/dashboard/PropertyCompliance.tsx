
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Send,
    Bot,
    User,
    Home,
    Flame,
    ClipboardList,
    MapPin,
    CheckCircle,
    Loader2,
    Copy,
    Check,
    Building,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// ...

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isTyping?: boolean;
}

interface ComplianceTopic {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const complianceTopics: ComplianceTopic[] = [
    {
        id: 'basement-secondary',
        title: 'Basement & Secondary Units',
        description: 'Requirements for legal secondary suites',
        icon: <Home className="h-5 w-5" />,
        color: 'bg-blue-100 text-blue-800'
    },
    {
        id: 'fire-safety',
        title: 'Fire & Safety Codes',
        description: 'Smoke alarms, exits, and fire separation',
        icon: <Flame className="h-5 w-5" />,
        color: 'bg-red-100 text-red-800'
    },
    {
        id: 'permits-renovations',
        title: 'Permits & Renovations',
        description: 'When you need a permit and how to apply',
        icon: <ClipboardList className="h-5 w-5" />,
        color: 'bg-yellow-100 text-yellow-800'
    },
    {
        id: 'occupancy-zoning',
        title: 'Occupancy & Zoning',
        description: 'Permitted uses and occupancy limits',
        icon: <MapPin className="h-5 w-5" />,
        color: 'bg-purple-100 text-purple-800'
    },
    {
        id: 'inspection-readiness',
        title: 'Inspection Readiness',
        description: 'Prepare for municipal inspections',
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'bg-green-100 text-green-800'
    }
];

export default function PropertyCompliancePage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    content: `You are an AI assistant specialized in Ontario property compliance, building codes, and safety regulations for landlords. 
                    Provide clear, accurate, and preventive advice about building codes, permits, inspections, secondary suites, and fire safety in Ontario. 
                    Use bullet points and professional formatting. 
                    Always include a disclaimer that this is for information purposes and not a substitute for official municipal advice or inspections.`
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

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch('http://localhost:3001/api/deepseek-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: conversationMessages,
                    temperature: 0.7,
                    max_tokens: 800
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

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
                title: "Error",
                description: "Failed to connect to AI service. Using offline mode."
            });

            // Fallback to simulated response
            const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: generateAIResponse(currentInput),
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAIResponse = (userInput: string): string => {
        const lowerInput = userInput.toLowerCase();

        // Simple simulated logic for now - typically this would call an API
        if (lowerInput.includes('basement') || lowerInput.includes('secondary') || lowerInput.includes('suite')) {
            return `For legal secondary suites (basement apartments) in Ontario, you must meet specific Building Code and Fire Code requirements:

**Key Requirements:**
- **Ceiling Height:** Minimum 1.95m (6'5") over at least 50% of the floor area.
- **Egress:** A direct exit to the exterior OR a shared exit with fire separation.
- **Windows:** Minimum window sizes are required for every bedroom (5% of floor area) for emergency escape.
- **Fire Separation:** 45-minute fire rating (drywall separation) between units.
- **Sound Transmission:** Minimum STC rating of 50.
- **Systems:** Separate electrical panels (sometimes required) and smoke/CO alarms interconnected.

**Next Steps:**
- Check your local municipal zoning bylaws first.
- Apply for a building permit before starting construction.
- Arrange for ESA (Electrical Safety Authority) inspection.

Would you like a more detailed checklist for a specific municipality?`;
        }

        if (lowerInput.includes('fire') || lowerInput.includes('alarm') || lowerInput.includes('smoke')) {
            return `Ontario Fire Code compliance is critical for rental properties. Here are the essentials:

**Safety Devices:**
- **Smoke Alarms:** Required on every level and outside all sleeping areas. Must be working and within expiration date (usually 10 years).
- **CO Alarms:** Required adjacent to all sleeping areas if there is a fuel-burning appliance or attached garage.
- **Fire Extinguishers:** Recommended in kitchens and mechanical rooms (required in some multi-unit dwellings).

**Structural Safety:**
- **Fire Separation:** Walls and floors between units must have fire-resistance ratings (often 45 min or 1 hr).
- **Means of Egress:** Clear, unobstructed paths to exits. 
- **Fire Doors:** Self-closing doors with proper latches between units or utility rooms.

**Maintenance:**
- Test alarms annually and keep a log.
- Annual inspection of fire safety systems might be required depending on building size.

Do you have specific questions about retrofitting an older property?`;
        }

        if (lowerInput.includes('permit') || lowerInput.includes('renovation')) {
            return `In Ontario, a **Building Permit** is generally required for:
      
- Finishing a basement or creating a secondary suite.
- Structural changes (removing walls, new windows/doors).
- New additions or garages.
- Major plumbing or HVAC work.
- Decks higher than 24 inches above ground.

**You typically do NOT need a permit for:**
- Replacing kitchen cabinets (without plumbing changes).
- Painting, flooring, or minor cosmetic repairs.
- Replacing a roof (if no structural changes).
- Fences (subject to height bylaws).

**Risk:** Renovating without a permit can lead to "Order to Comply," double permit fees, or having to uncover/remove work.

Are you planning a specific renovation project?`;
        }

        // Default response
        return `Thank you for asking about property compliance. I can help you navigate Ontario's regulations to ensure your property is safe and legal.

**I can assist with:**
- Ontario Building Code requirements
- Fire Code safety checklists
- Secondary suite (basement unit) legalization
- Permit application processes
- Inspection preparation guidelines

**Note:** This information is for preventive compliance planning. Always consult with a qualified inspector or your local building department for final approvals.

What specific compliance topic are you working on today?`;
    };

    const handleTopicClick = (topic: ComplianceTopic) => {
        const topicMessage = `I'd like to check compliance for ${topic.title.toLowerCase()}. ${topic.description}`;
        setInputValue(topicMessage);
    };

    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            toast({
                title: "Copied!",
                description: "Message copied to clipboard",
            });
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to copy message",
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Building className="h-8 w-8 text-blue-600" />
                    Property Compliance AI (Ontario)
                </h1>
                <p className="text-muted-foreground">
                    Verify your property against Ontario building, safety, and zoning regulations before inspections or enforcement.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Interface */}
                <div className="lg:col-span-3">
                    <Card className="h-[calc(100vh-12rem)] flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                Compliance Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        <div className="bg-blue-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                            <Building className="h-10 w-10 text-blue-600" />
                                        </div>
                                        <p className="font-medium text-lg text-gray-900 mb-1">Start a conversation about property compliance</p>
                                        <p className="text-sm">Ask about building codes, permits, or safety inspections</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div className={`rounded-lg p-3 ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs opacity-70">
                                                            {message.timestamp.toLocaleTimeString()}
                                                        </span>
                                                        {message.role === 'assistant' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                                                onClick={() => copyToClipboard(message.content, message.id)}
                                                            >
                                                                {copiedMessageId === message.id ? (
                                                                    <Check className="h-3 w-3" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-gray-600">Checking regulations...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about building codes, permits, inspections, or property compliance…"
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    size="icon"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Compliance Topics Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Compliance Topics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {complianceTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleTopicClick(topic)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${topic.color}`}>
                                            {topic.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm">{topic.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {topic.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Pro Tip</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                                <p>Always keep digital copies of your permits and inspection reports. Regular self-inspections can save thousands in potential fines.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
