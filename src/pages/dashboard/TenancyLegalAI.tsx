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
  Check,
  Home,
  DollarSign
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
  question: string;
}

const tenancyTopics: LegalTopic[] = [
  {
    id: 'tenant-rights',
    title: 'Tenant Rights',
    description: 'Understanding your rights as a tenant',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    question: 'What are my basic rights as a tenant?'
  },
  {
    id: 'lease-terms',
    title: 'Lease Agreements',
    description: 'Questions about rental contracts and terms',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800',
    question: 'What should I look for in a lease agreement?'
  },
  {
    id: 'deposits',
    title: 'Security Deposits',
    description: 'Rules about deposits and their return',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-yellow-100 text-yellow-800',
    question: 'How does security deposit work and when do I get it back?'
  },
  {
    id: 'maintenance',
    title: 'Repairs & Maintenance',
    description: 'Landlord responsibilities for property upkeep',
    icon: <Lightbulb className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    question: 'What repairs is my landlord responsible for?'
  },
  {
    id: 'eviction',
    title: 'Eviction Protection',
    description: 'Legal procedures and tenant protections',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800',
    question: 'What are the legal requirements for eviction?'
  },
  {
    id: 'privacy',
    title: 'Privacy Rights',
    description: 'Landlord entry and tenant privacy',
    icon: <Home className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-800',
    question: 'Can my landlord enter my apartment without notice?'
  }
];

export default function TenancyLegalAIPage() {
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

  const handleTopicClick = (question: string) => {
    setInputValue(question);
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
      console.log('Sending request to DeepSeek API via local proxy server...');
      
      const conversationMessages = [
        {
          role: 'system',
          content: `You are an AI legal assistant for tenancy law. Provide clear, accurate answers about tenant rights, leases, deposits, repairs, evictions, and privacy. Use bullet points and emojis. Keep responses concise but helpful (aim for 300-500 words). Remind users this is general information, not legal advice.`
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

      // Call local proxy server which proxies to DeepSeek
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('http://localhost:3001/api/deepseek-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversationMessages,
          temperature: 0.7,
          max_tokens: 800 // Reduced from 2000 for faster responses
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('API Response received');
      
      const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      console.log('Successfully added AI response to messages');
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      
      // Show error to user
      toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}. Using offline mode.`);
      
      // Fallback to generated response if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateTenancyResponse(currentInput),
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTenancyResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('tenant') && lowerInput.includes('right')) {
      return `**Your Basic Tenant Rights:**

🏠 **Right to Habitable Housing**
- Safe and sanitary living conditions
- Working plumbing, heating, and electricity
- Structural integrity of the building
- Protection from health hazards

🔒 **Right to Privacy**
- Landlord must provide advance notice (typically 24-48 hours)
- Entry only for specific reasons (repairs, inspections, emergencies)
- Right to quiet enjoyment of your home

💰 **Financial Protections**
- Security deposit must be returned (minus lawful deductions)
- Written itemization of any deductions
- Protection from unfair rent increases
- Right to proper notice of rent changes

⚖️ **Legal Protections**
- Cannot be evicted without proper legal process
- Protection from discrimination (Fair Housing Act)
- Right to organize with other tenants
- Protection from retaliation for asserting rights

📝 **Documentation Rights**
- Right to receive receipts for rent payments
- Copy of signed lease agreement
- Written notice of any changes
- Inspection reports and maintenance records

Would you like more details on any specific tenant right?`;
    }
    
    if (lowerInput.includes('lease') || lowerInput.includes('contract') || lowerInput.includes('agreement')) {
      return `**What to Look For in a Lease Agreement:**

✅ **Essential Terms to Check:**

**1. Financial Terms**
- Monthly rent amount and due date
- Security deposit amount and conditions
- Late payment fees and grace periods
- Utilities included or separate
- Rent increase terms and notice period

**2. Lease Duration**
- Start and end dates
- Renewal options and terms
- Early termination conditions
- Month-to-month vs. fixed-term

**3. Property Use & Restrictions**
- Number of occupants allowed
- Pet policies (types, deposits, fees)
- Smoking policy
- Subletting and guest policies
- Noise and quiet hours

**4. Maintenance & Repairs**
- Landlord responsibilities
- Tenant responsibilities
- Emergency repair procedures
- Response time requirements

**5. Important Clauses**
- Entry and inspection procedures
- Property modification rules
- Insurance requirements
- Dispute resolution process

⚠️ **Red Flags to Watch:**
- Unreasonable penalty clauses
- Waiver of basic tenant rights
- Unfair maintenance responsibilities
- Vague or unclear terms
- Missing essential information

💡 **Before Signing:**
- Read everything carefully
- Ask questions about unclear terms
- Get everything in writing
- Keep a signed copy for your records
- Document property condition with photos

Need help understanding a specific lease clause?`;
    }
    
    if (lowerInput.includes('deposit') || lowerInput.includes('security')) {
      return `**Security Deposit Guide:**

💵 **How Security Deposits Work:**

**Maximum Amount:**
- Most states limit deposits (typically 1-2 months rent)
- Additional pet deposits may be allowed
- Must be reasonable and comply with state law

**What It Covers:**
- Unpaid rent
- Damage beyond normal wear and tear
- Cleaning costs (if excessive)
- Breach of lease terms

**NOT Covered (Normal Wear & Tear):**
- Faded paint or wallpaper
- Minor carpet wear from use
- Small nail holes from pictures
- Normal appliance wear
- Age-related deterioration

📋 **Getting Your Deposit Back:**

**1. Move-Out Preparation:**
- Clean thoroughly (professional if required)
- Repair any damage you caused
- Remove all belongings
- Take photos/video of condition
- Return all keys

**2. Timeline:**
- Most states: 14-30 days after move-out
- Landlord must provide itemized deductions
- Any remaining deposit must be returned

**3. Itemized Statement:**
- List of all deductions
- Receipts or estimates for repairs
- Explanation of charges
- Remaining balance

🛡️ **Your Rights:**
- Deposit must be held in separate account (some states)
- Interest may be required (check state law)
- Cannot deduct for normal wear and tear
- Must receive itemized list of deductions
- Can dispute unfair deductions

⚠️ **If Landlord Won't Return:**
1. Send formal written demand
2. Document everything
3. File complaint with housing authority
4. Small claims court (if necessary)
5. May recover 2-3x deposit plus costs

Questions about a specific deposit issue?`;
    }
    
    if (lowerInput.includes('repair') || lowerInput.includes('maintenance') || lowerInput.includes('fix')) {
      return `**Repairs & Maintenance Responsibilities:**

🔧 **Landlord Must Fix:**

**Essential Services:**
- Heating and air conditioning
- Plumbing and hot water
- Electrical systems
- Gas service
- Sewage and waste disposal

**Structural & Safety:**
- Roof leaks
- Foundation issues
- Structural damage
- Fire safety equipment (alarms, extinguishers)
- Secure locks and doors
- Window repairs
- Pest infestations

**Common Areas:**
- Hallways and stairways
- Elevators
- Parking areas
- Shared laundry facilities

👤 **Tenant Typically Responsible For:**
- Light bulbs and batteries
- Air filters
- Minor caulking
- Drain unclogging (if caused by tenant)
- Damage caused by tenant or guests

📞 **How to Request Repairs:**

**1. Report Immediately:**
- Write it down (email or written notice)
- Include detailed description
- Take photos/videos if possible
- Keep copies of all communications

**2. Document Everything:**
- Date of initial report
- Follow-up communications
- Photos of problem
- Any safety concerns

**3. Response Times:**
- Emergency: Immediate (24 hours)
- Urgent: 3-7 days
- Non-urgent: 30 days
(Varies by state law)

🚨 **If Repairs Aren't Made:**

**Step 1:** Send formal written notice
**Step 2:** Allow reasonable time to fix
**Step 3:** Contact local housing authority
**Step 4:** Options may include:
- Repair and deduct from rent
- Withhold rent (check state law)
- Break lease without penalty
- Sue for damages

⚠️ **Important Notes:**
- Never withhold rent without legal basis
- Follow proper procedures for your state
- Keep paying rent into escrow if withholding
- Document everything for potential legal action

Specific repair issue you need help with?`;
    }
    
    if (lowerInput.includes('evict') || lowerInput.includes('removal') || lowerInput.includes('kicked out')) {
      return `**Eviction Laws & Tenant Protections:**

⚖️ **Legal Eviction Requirements:**

**Valid Reasons for Eviction:**
1. Non-payment of rent
2. Lease violation
3. Illegal activity on premises
4. Property damage
5. End of lease term (with proper notice)
6. Owner move-in (in some jurisdictions)

**Cannot Evict For:**
- Race, religion, national origin, sex, disability, familial status
- Retaliation for asserting rights
- Complaining to housing authority
- Joining tenant organization
- Discriminatory reasons

📝 **Proper Eviction Process:**

**Step 1: Written Notice**
- Pay or Quit (3-5 days typically)
- Cure or Quit (fix violation)
- Unconditional Quit (serious violations)
- Must be in writing
- Specific time period required

**Step 2: Unlawful Detainer Lawsuit**
- Filed only after notice period expires
- Court summons served to tenant
- Hearing scheduled

**Step 3: Court Hearing**
- Both parties present evidence
- Tenant can present defenses
- Judge makes ruling

**Step 4: Writ of Possession**
- Only if landlord wins
- Sheriff enforces eviction
- Tenant given time to leave (5-7 days)

🛡️ **Your Protections:**

**Illegal "Self-Help" Eviction:**
Landlord CANNOT:
- Change locks without court order
- Remove your belongings
- Shut off utilities
- Threaten or harass you
- Remove doors or windows

**Your Defenses:**
- Landlord didn't follow proper procedure
- Rent was paid on time
- Repairs weren't made (habitability)
- Retaliation for asserting rights
- Discrimination

**During Eviction:**
- Continue paying rent (show good faith)
- Document everything
- Attend all court hearings
- Seek legal aid if needed
- Know your state's timeline

⏰ **Typical Timeline:**
- Notice period: 3-30 days
- Court filing to hearing: 20-45 days
- After judgment: 5-7 days to vacate
- Total: Can be 1-3 months minimum

💡 **If Facing Eviction:**
1. Don't ignore notices
2. Respond to court summons
3. Gather evidence and documents
4. Consider mediation
5. Seek legal assistance
6. Know your rights

Need specific help with an eviction notice?`;
    }
    
    if (lowerInput.includes('privacy') || lowerInput.includes('enter') || lowerInput.includes('landlord entry')) {
      return `**Tenant Privacy Rights:**

🔒 **Landlord Entry Rules:**

**Notice Requirements:**
- Most states: 24-48 hours advance notice
- Must be in writing (or verbal in some states)
- Must specify date, time, and reason
- Reasonable hours (typically 8am-8pm)

**Valid Reasons for Entry:**
1. Make necessary repairs
2. Show property to prospective tenants/buyers
3. Scheduled inspections
4. Court order
5. Emergency situations

**Emergency Entry (No Notice Required):**
- Fire or smoke
- Gas leak
- Burst pipes or flooding
- Other immediate dangers
- Abandoned property (suspected)

🚫 **What Landlord CANNOT Do:**

- Enter whenever they want
- Harass or repeatedly enter
- Enter without valid reason
- Spy or surveil tenant
- Install cameras inside unit
- Give others access without permission

**Your Rights:**
- Right to quiet enjoyment
- Right to privacy in your home
- Right to refuse unreasonable entry
- Right to be present during entry
- Right to reschedule (within reason)

📋 **Document Entry Violations:**
- Keep log of all entries
- Note date, time, reason
- Save all entry notices
- Take photos/videos if appropriate
- Keep witnesses' contact info

⚖️ **If Landlord Violates Privacy:**

**Immediate Actions:**
1. Document the violation
2. Send written objection
3. Request they follow proper procedure
4. Keep all communications

**Legal Options:**
- File complaint with housing authority
- Sue for damages or harassment
- Possibly break lease without penalty
- Reduce rent for reduced enjoyment
- Obtain restraining order (severe cases)

💰 **Potential Compensation:**
- Actual damages
- Reduced rent
- Moving costs
- Emotional distress (severe cases)
- Attorney fees

🏠 **Special Situations:**

**Repairs:**
- Entry for repairs generally allowed with notice
- Emergency repairs: No notice needed
- You can request to be present

**Showing Property:**
- Reasonable notice required
- Reasonable hours
- Cannot be excessive or harassing

**Inspections:**
- Move-in/Move-out: Required
- Annual: Usually allowed with notice
- More frequent: May be unreasonable

Questions about a specific entry situation?`;
    }

    // Default response
    return `**AI Legal Assistant for Tenancy Law**

I can help you with questions about:

🏠 **Tenant Rights & Responsibilities**
- Your basic rights as a tenant
- What landlords must provide
- Your obligations under the lease

📋 **Lease Agreements**
- Understanding lease terms
- What to look for before signing
- Lease violations and consequences

💰 **Security Deposits**
- How deposits work
- Getting your deposit back
- Disputing unfair deductions

🔧 **Repairs & Maintenance**
- Landlord repair responsibilities
- How to request repairs
- What to do if repairs aren't made

⚖️ **Eviction Protection**
- Legal eviction process
- Your rights during eviction
- How to fight wrongful eviction

🔒 **Privacy Rights**
- Landlord entry rules
- Notice requirements
- What to do about violations

**Try clicking one of the topic cards above or ask your specific question!**

⚠️ **Disclaimer:** This information is for educational purposes only and not legal advice. Laws vary by jurisdiction. For specific legal situations, please consult a qualified attorney in your area.`;
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Legal Assistant</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Get instant answers about tenancy law and your rights
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This AI provides general information about tenancy law for educational purposes only. 
              It is not legal advice. Laws vary by state and jurisdiction. For specific legal matters, please consult with a qualified attorney.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Topics */}
      {messages.length === 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenancyTopics.map((topic) => (
              <Card 
                key={topic.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleTopicClick(topic.question)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${topic.color}`}>
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{topic.title}</h3>
                      <p className="text-xs text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Legal Assistant Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Welcome to the AI Legal Assistant</p>
                <p className="text-sm max-w-md">
                  Ask me anything about tenancy law, your rights as a tenant, lease agreements, 
                  security deposits, repairs, evictions, and more. Click a topic above or type your question below!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {message.content}
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => handleCopyMessage(message.id, message.content)}
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
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about tenancy law..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
