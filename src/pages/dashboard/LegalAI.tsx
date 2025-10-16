import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Scale, 
  FileText, 
  Lightbulb, 
  AlertCircle,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface LegalTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const legalTopics: LegalTopic[] = [
  {
    id: 'lease-agreements',
    title: 'Lease Agreements',
    description: 'Questions about rental contracts, terms, and conditions',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    description: 'Understanding tenant rights and landlord responsibilities',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'eviction-process',
    title: 'Eviction Process',
    description: 'Legal procedures for eviction and tenant removal',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'property-maintenance',
    title: 'Property Maintenance',
    description: 'Landlord obligations for property upkeep and repairs',
    icon: <Lightbulb className="h-5 w-5" />,
    color: 'bg-yellow-100 text-yellow-800'
  }
];

export default function LegalAIPage() {
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
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue.trim()),
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('lease') || lowerInput.includes('contract')) {
      return `Based on your question about lease agreements, here's what you should know:

**Key Lease Terms:**
- Lease duration and renewal options
- Rent amount and payment schedule
- Security deposit requirements
- Property use restrictions
- Maintenance responsibilities

**Important Considerations:**
- Ensure all terms are clearly defined
- Include pet policies if applicable
- Specify utility responsibilities
- Define late payment penalties
- Include termination clauses

Would you like me to elaborate on any specific aspect of lease agreements?`;
    }
    
    if (lowerInput.includes('tenant') || lowerInput.includes('right')) {
      return `Regarding tenant rights, here are the fundamental protections:

**Basic Tenant Rights:**
- Right to habitable living conditions
- Right to privacy and quiet enjoyment
- Right to proper notice before entry
- Right to security deposit return
- Right to dispute unfair charges

**Landlord Responsibilities:**
- Maintain structural integrity
- Provide essential services (heat, water, electricity)
- Address safety hazards promptly
- Respect tenant privacy
- Follow proper eviction procedures

**Important Notes:**
- Rights vary by jurisdiction
- Document all communications
- Keep records of maintenance requests
- Know your local housing laws

Is there a specific tenant rights issue you'd like me to address?`;
    }
    
    if (lowerInput.includes('eviction') || lowerInput.includes('remove')) {
      return `The eviction process must follow strict legal procedures:

**Legal Eviction Process:**
1. **Valid Grounds**: Non-payment, lease violations, property damage
2. **Proper Notice**: Written notice with specific timeframe
3. **Court Filing**: File eviction lawsuit if tenant doesn't comply
4. **Court Hearing**: Both parties present their case
5. **Writ of Possession**: If court rules in landlord's favor
6. **Sheriff Execution**: Law enforcement removes tenant

**Important Requirements:**
- Cannot use self-help eviction (changing locks, removing belongings)
- Must provide proper notice period (varies by state)
- Cannot evict for discriminatory reasons
- Must follow local housing court procedures

**Common Mistakes to Avoid:**
- Retaliatory eviction
- Improper notice procedures
- Discrimination based on protected classes
- Self-help eviction methods

Would you like guidance on a specific eviction situation?`;
    }
    
    if (lowerInput.includes('maintenance') || lowerInput.includes('repair')) {
      return `Property maintenance responsibilities are crucial for landlords:

**Landlord Maintenance Obligations:**
- Structural integrity (roof, walls, foundation)
- Essential systems (plumbing, electrical, HVAC)
- Safety features (smoke detectors, locks)
- Common areas (hallways, lobbies)
- Compliance with health codes

**Tenant Responsibilities:**
- Basic cleanliness and sanitation
- Minor repairs (light bulbs, batteries)
- Reporting maintenance issues promptly
- Not causing damage through negligence
- Following proper use guidelines

**Best Practices:**
- Respond to maintenance requests within 24-48 hours
- Keep detailed records of all repairs
- Use licensed contractors for major work
- Provide emergency contact information
- Regular property inspections

**Legal Considerations:**
- Failure to maintain can lead to rent withholding
- Habitability requirements must be met
- Emergency repairs may be tenant's responsibility
- Document all maintenance communications

Do you have a specific maintenance issue you need guidance on?`;
    }

    // Default response
    return `Thank you for your question about "${userInput}". As your Legal AI assistant, I'm here to help with landlord-tenant legal matters.

**How I can help:**
- Lease agreement guidance
- Tenant rights and responsibilities
- Eviction procedures and requirements
- Property maintenance obligations
- Legal compliance questions
- Dispute resolution strategies

**Important Disclaimer:**
This information is for general guidance only and should not replace professional legal advice. Laws vary by jurisdiction, and specific situations may require consultation with a qualified attorney.

Please feel free to ask more specific questions about your situation, and I'll provide detailed guidance based on general legal principles.`;
  };

  const handleTopicClick = (topic: LegalTopic) => {
    const topicMessage = `I'd like to learn more about ${topic.title.toLowerCase()}. ${topic.description}`;
    setInputValue(topicMessage);
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
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
          <Scale className="h-8 w-8 text-blue-600" />
          Legal AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get instant legal guidance for landlord-tenant matters. Ask questions about leases, tenant rights, evictions, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Legal Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with your Legal AI assistant</p>
                    <p className="text-sm">Ask about leases, tenant rights, evictions, or property maintenance</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user'
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
                        <span className="text-sm text-gray-600">AI is thinking...</span>
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
                  placeholder="Ask a legal question..."
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

        {/* Legal Topics Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legal Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {legalTopics.map((topic) => (
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
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>• Be specific about your situation</p>
                <p>• Include relevant details and dates</p>
                <p>• Ask follow-up questions for clarity</p>
                <p>• Remember: This is general guidance only</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
