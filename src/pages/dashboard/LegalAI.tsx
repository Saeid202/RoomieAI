import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
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
    id: "lease-agreements",
    title: "Lease Agreements",
    description: "Questions about rental contracts, terms, and conditions",
    icon: <FileText className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-100",
  },
  {
    id: "tenant-rights",
    title: "Tenant Rights",
    description: "Understanding tenant rights and landlord responsibilities",
    icon: <Scale className="h-4 w-4" />,
    color: "text-green-600 bg-green-100",
  },
  {
    id: "eviction-process",
    title: "Eviction Process",
    description: "Legal procedures for eviction and tenant removal",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-red-600 bg-red-100",
  },
  {
    id: "property-maintenance",
    title: "Property Maintenance",
    description: "Landlord obligations for property upkeep and repairs",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-yellow-600 bg-yellow-100",
  },
];

export default function LegalAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes("lease") || lowerInput.includes("contract")) {
      return `Based on your question about lease agreements, here's what you should know:\n\n**Key Lease Terms:**\n- Lease duration and renewal options\n- Rent amount and payment schedule\n- Security deposit requirements\n- Property use restrictions\n- Maintenance responsibilities\n\n**Important Considerations:**\n- Ensure all terms are clearly defined\n- Include pet policies if applicable\n- Specify utility responsibilities\n- Define late payment penalties\n\nWould you like me to elaborate on any specific aspect?`;
    }
    if (lowerInput.includes("tenant") || lowerInput.includes("right")) {
      return `Regarding tenant rights, here are the fundamental protections:\n\n**Basic Tenant Rights:**\n- Right to habitable living conditions\n- Right to privacy and quiet enjoyment\n- Right to proper notice before entry\n- Right to security deposit return\n\n**Landlord Responsibilities:**\n- Maintain structural integrity\n- Provide essential services\n- Address safety hazards promptly\n\nIs there a specific tenant rights issue you'd like me to address?`;
    }
    if (lowerInput.includes("eviction") || lowerInput.includes("remove")) {
      return `The eviction process must follow strict legal procedures:\n\n**Legal Eviction Steps:**\n1. Valid grounds (non-payment, lease violations)\n2. Written notice with specific timeframe\n3. Court filing if tenant doesn't comply\n4. Court hearing — both parties present\n5. Writ of possession if court rules in your favor\n\n**Important:** Cannot use self-help eviction (changing locks, removing belongings).\n\nWould you like guidance on a specific situation?`;
    }
    if (lowerInput.includes("maintenance") || lowerInput.includes("repair")) {
      return `Property maintenance responsibilities are crucial:\n\n**Landlord Obligations:**\n- Structural integrity (roof, walls, foundation)\n- Essential systems (plumbing, electrical, HVAC)\n- Safety features (smoke detectors, locks)\n- Compliance with health codes\n\n**Best Practices:**\n- Respond to requests within 24–48 hours\n- Keep detailed records of all repairs\n- Use licensed contractors for major work\n\nDo you have a specific maintenance issue?`;
    }
    return `Thank you for your question. As your Legal AI assistant, I can help with:\n\n- Lease agreement guidance\n- Tenant rights and responsibilities\n- Eviction procedures\n- Property maintenance obligations\n- Legal compliance questions\n\n**Disclaimer:** This is general guidance only and does not replace professional legal advice.\n\nFeel free to ask more specific questions about your situation.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(userMessage.content),
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleTopicClick = (topic: LegalTopic) => {
    setInputValue(`I'd like to learn more about ${topic.title.toLowerCase()}. ${topic.description}`);
    textareaRef.current?.focus();
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)] -mx-6 -mt-0">

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Scale className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Legal AI Assistant</h1>
            <p className="text-xs text-gray-500">Get instant legal guidance for landlord-tenant matters</p>
          </div>
        </div>
      </div>

      {/* ── Body (chat + sidebar) ── */}
      <div className="flex flex-1 min-h-0">

      {/* ── Main chat column ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Messages */}
        <div className="flex-1 px-6 py-6 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-16">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                <Scale className="h-7 w-7 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal AI Assistant</h1>
              <p className="text-gray-500 text-center max-w-md">
                Get instant legal guidance for landlord-tenant matters. Ask about leases, tenant rights, evictions, and more.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-violet-600" />
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-gray-100/80 border border-gray-200 text-gray-900 rounded-bl-sm"
                    }`}>
                      {message.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              <div className="min-h-[60px]">
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="bg-gray-100/80 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      <span className="text-sm text-gray-500">Thinking...</span>
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
                placeholder="Ask a legal question... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-gray-900 placeholder:text-gray-400 min-h-[44px] max-h-[160px] py-2 text-sm"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 rounded-xl h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              General guidance only — not a substitute for professional legal advice.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-72 flex-shrink-0 border-l border-gray-200 px-4 py-6 space-y-6">

        {/* Legal Topics */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Legal Topics</h2>
          <div className="space-y-2">
            {legalTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-100/80 border border-gray-200 hover:bg-gray-200/60 transition-colors text-left"
              >
                <span className={`p-1.5 rounded-lg flex-shrink-0 ${topic.color}`}>{topic.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{topic.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Quick Tips</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Be specific about your situation</p>
            <p>• Include relevant details and dates</p>
            <p>• Ask follow-up questions for clarity</p>
            <p>• This is general guidance only</p>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
