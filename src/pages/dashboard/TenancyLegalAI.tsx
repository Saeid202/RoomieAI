import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  CheckSquare,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    title: 'Harassment / illegal entry',
    description: 'Harassment, illegal entry, or prohibited actions',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    question: 'How do I stop my landlord from harassing me or entering illegally?'
  },
  {
    id: 'maintenance',
    title: 'Repairs / mold / pests',
    description: 'Maintenance issues, mold, or pest control',
    icon: <Lightbulb className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    question: 'What do I do about mold, pests, or broken repairs?'
  },
  {
    id: 'illegal-rent',
    title: 'Illegal fees / rent',
    description: 'Illegal rent increases or prohibited fees',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'bg-emerald-100 text-emerald-800',
    question: 'How do I get back illegal rent or prohibited fees?'
  },
  {
    id: 'lost-services',
    title: 'Lost Services',
    description: 'Reduced utilities or discontinued amenities',
    icon: <ShieldAlert className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-800',
    question: 'What do I do if my landlord stops a service?'
  },
  {
    id: 'eviction',
    title: 'Bad-faith eviction',
    description: 'Landlord gave a bad faith N12 or N13 notice',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'bg-red-100 text-red-800',
    question: 'What if my landlord gave me an eviction notice in bad faith?'
  }
];

interface TenantForm {
  id: string;
  label: string;
  formType: string;
  description: string;
}

const commonTenantForms: TenantForm[] = [
  { id: 't2', label: 'Harassment / illegal entry', formType: 'T2', description: 'Landlord harassed you or violated privacy' },
  { id: 't6', label: 'Repairs / mold / pests', formType: 'T6', description: 'Landlord failed to repair or maintain' },
  { id: 't1', label: 'Illegal fees / rent', formType: 'T1', description: 'Landlord collected illegal rent or fees' },
  { id: 't3', label: 'Lost Services', formType: 'T3', description: 'Landlord reduced or discontinued a service' },
  { id: 't5', label: 'Bad-faith eviction', formType: 'T5', description: 'Landlord gave a bad faith N12 or N13' },
];

export default function TenancyLegalAIPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicClick = (question: string, formId?: string) => {
    setInputValue(question);
    if (formId) setSelectedForm(formId);
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

    // Auto-select form based on input if not selected
    if (!selectedForm) {
      if (currentInput.toLowerCase().includes('maintenance') || currentInput.toLowerCase().includes('repair')) setSelectedForm('t6');
      else if (currentInput.toLowerCase().includes('harass') || currentInput.toLowerCase().includes('privacy')) setSelectedForm('t2');
      else if (currentInput.toLowerCase().includes('rebate') || currentInput.toLowerCase().includes('illegal rent')) setSelectedForm('t1');
      else if (currentInput.toLowerCase().includes('service') || currentInput.toLowerCase().includes('discontinued')) setSelectedForm('t3');
      else if (currentInput.toLowerCase().includes('bad faith') || currentInput.toLowerCase().includes('n12') || currentInput.toLowerCase().includes('moving out') || currentInput.toLowerCase().includes('terminat')) setSelectedForm('t5');
    }

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
    <div className="w-full p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">AI Legal Assistant</h1>
            <p className="text-slate-600 text-base md:text-lg font-medium">
              Get instant answers about tenancy law and your rights
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-base text-yellow-900 leading-relaxed font-medium">
              <strong>Disclaimer:</strong> This AI provides general information about tenancy law for educational purposes only.
              It is not legal advice. Laws vary by state and jurisdiction. For specific legal matters, please consult with a qualified attorney.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Topics */}
      {messages.length === 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Popular Topics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {tenancyTopics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-md transition-all border-slate-200 hover:border-primary/50 group"
                onClick={() => handleTopicClick(
                  topic.question,
                  topic.id === 'maintenance' ? 't6' :
                    topic.id === 'tenant-rights' ? 't2' :
                      topic.id === 'eviction' ? 't5' :
                        topic.id === 'illegal-rent' ? 't1' :
                          topic.id === 'lost-services' ? 't3' :
                            topic.id === 'deposits' ? 't1' :
                              undefined
                )}
              >
                <CardContent className="p-3 text-center flex flex-col items-center">
                  <div className={`p-2 rounded-xl mb-2 transition-colors ${topic.color.replace('text-', 'group-hover:bg-opacity-80 text-')}`}>
                    {topic.icon}
                  </div>
                  <h3 className="font-black text-sm leading-tight text-slate-800">{topic.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-8">
          <Card className="shadow-md border-slate-200 h-[650px] flex flex-col overflow-hidden bg-white">
            <CardHeader className="border-b bg-white py-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Bot className="h-6 w-6 text-primary" />
                Legal Assistant Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 relative min-h-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center border border-slate-100 shadow-sm mb-6">
                      <Scale className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to your Tenant Advocacy AI</h3>
                    <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                      Protect your rights. Ask about maintenance, illegal rent increases, privacy violations, or how to file with the LTB.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-slate-600" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${message.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-900'
                          }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-base font-medium leading-relaxed">
                            {message.content}
                          </pre>
                        </div>
                        <div className={`flex items-center gap-3 mt-4 pt-3 border-t ${message.role === 'user' ? 'border-white/10' : 'border-slate-100'}`}>
                          <span className={`text-xs font-bold opacity-60`}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 ml-auto text-slate-400 hover:text-slate-600"
                              onClick={() => handleCopyMessage(message.id, message.content)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium text-slate-500">Reviewing RTA protocols...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Professional Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all p-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your situation (e.g., Landlord won't fix my leaking sink)..."
                    disabled={isLoading}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent py-4 px-3 text-base font-medium placeholder:text-slate-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all h-12 px-6 font-bold"
                  >
                    <Send className="h-5 w-5 mr-1" /> Send
                  </Button>
                </div>
                <p className="text-sm font-bold text-center text-slate-500 mt-3">
                  AI Tenant Assistant provides information only. Always verify with the Landlord and Tenant Board.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Tenant Toolkit */}
        <div className="lg:col-span-4 space-y-4">
          <Tabs defaultValue="toolkit" className="w-full">
            <div className="grid grid-cols-2 bg-slate-100/50 p-1 rounded-xl mb-4">
              <TabsList className="bg-transparent h-9 w-full">
                <TabsTrigger value="toolkit" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-black">Toolkit</TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-black">Timeline</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="toolkit" className="mt-0 space-y-4">
              <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-4 bg-blue-50/30">
                  <CardTitle className="text-base font-black uppercase text-blue-700 flex items-center gap-2">
                    <CheckSquare className="h-3.5 w-3.5" /> Next Best Action
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 px-4">
                  {selectedForm ? (
                    <div className="space-y-4">
                      {commonTenantForms.find(f => f.id === selectedForm) && (
                        <div>
                          <div className="font-black text-lg text-slate-900 mb-1">
                            File Form {commonTenantForms.find(f => f.id === selectedForm)?.formType}
                          </div>
                          <p className="text-base text-slate-600 font-medium leading-relaxed">
                            {commonTenantForms.find(f => f.id === selectedForm)?.description}
                          </p>
                        </div>
                      )}

                      <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black gap-2 text-base shadow-md"
                        onClick={() => navigate(`/dashboard/forms/${selectedForm}`)}
                      >
                        <FileText className="h-5 w-5" /> Start Application
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-500 font-bold px-4 leading-relaxed">
                        Describe your issue in the chat to see recommended LTB applications.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-base font-black uppercase text-slate-600 flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5" /> Required Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-5 px-5 text-base font-medium space-y-4">
                  {selectedForm === 't6' ? (
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <div className="mt-1 h-1 w-1 rounded-full bg-blue-500 shrink-0" />
                        <span>Photos/videos of the maintenance issue dated.</span>
                      </li>
                      <li className="flex gap-2">
                        <div className="mt-1 h-1 w-1 rounded-full bg-blue-500 shrink-0" />
                        <span>Copies of written requests to the landlord (Email/Text).</span>
                      </li>
                    </ul>
                  ) : selectedForm === 't2' ? (
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <div className="mt-1 h-1 w-1 rounded-full bg-blue-500 shrink-0" />
                        <span>Log of dates/times of unauthorized entry or harassment.</span>
                      </li>
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic">Select a topic for evidence checklist.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base font-black uppercase text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" /> Avoid These Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-5 px-5 text-sm font-bold items-start flex flex-col gap-3 text-amber-900">
                  <div className="flex gap-2">
                    <span className="font-bold">❌</span>
                    <span><strong className="text-amber-900">Do not withhold rent</strong> without a court order.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold">❌</span>
                    <span>Don't rely on verbal agreements. Get everything in writing.</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-base font-black uppercase text-slate-600 flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5" /> LTB Case Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6 px-4">
                  <div className="relative border-l-2 border-slate-100 ml-2 pl-6 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-1 ring-slate-100"></div>
                      <h4 className="text-base font-black text-slate-900">Notice to Landlord</h4>
                      <p className="text-sm text-slate-600 font-medium">Provide written notice first.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-slate-200 border-4 border-white"></div>
                      <h4 className="text-base font-black text-slate-900">File with LTB</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>


        </div>
      </div>
    </div>
  );
}
