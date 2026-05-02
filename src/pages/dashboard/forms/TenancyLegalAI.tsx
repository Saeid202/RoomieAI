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
  DollarSign,
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

// Color theme per form — drives the sidebar card dynamically
const formColorTheme: Record<string, { bg: string; border: string; text: string; subtext: string; btn: string; btnHover: string }> = {
  t2: { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-900',   subtext: 'text-blue-700',   btn: 'bg-blue-600',    btnHover: 'hover:bg-blue-700'    },
  t6: { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-900', subtext: 'text-purple-700', btn: 'bg-purple-600',  btnHover: 'hover:bg-purple-700'  },
  t1: { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-900',subtext: 'text-emerald-700',btn: 'bg-emerald-600', btnHover: 'hover:bg-emerald-700' },
  t3: { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-900', subtext: 'text-orange-700', btn: 'bg-orange-500',  btnHover: 'hover:bg-orange-600'  },
  t5: { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-900',    subtext: 'text-red-700',    btn: 'bg-red-600',     btnHover: 'hover:bg-red-700'     },
};

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
    <div className="flex flex-col min-h-[calc(100vh-130px)] -mx-6 bg-gray-100">

      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Scale className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">AI Legal Assistant</h1>
            <p className="text-xs text-gray-500">Get instant answers about tenancy law and your rights</p>
          </div>
        </div>
      </div>

      {/* Topic selector */}
      <div className="flex-shrink-0 px-6 py-5 bg-white border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Select Your Case Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tenancyTopics.map((topic) => {
            const formId = topic.id === 'maintenance' ? 't6' :
              topic.id === 'tenant-rights' ? 't2' :
              topic.id === 'eviction' ? 't5' :
              topic.id === 'illegal-rent' ? 't1' :
              topic.id === 'lost-services' ? 't3' : undefined;
            const isSelected = selectedForm === formId;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.question, formId)}
                className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected
                    ? `${topic.color.split(' ')[0]} border-current shadow-md -translate-y-0.5`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isSelected ? topic.color : "bg-gray-100 text-gray-500"
                }`}>
                  {topic.icon}
                </div>
                <div>
                  <p className={`text-xs font-semibold leading-tight ${isSelected ? topic.color.split(' ')[1] || "text-gray-900" : "text-gray-700"}`}>
                    {topic.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{topic.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 bg-white">

        {/* Chat column */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Messages */}
          <div className="flex-1 px-6 py-6 min-h-[400px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-16">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <Scale className="h-7 w-7 text-violet-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tenant Advocacy AI</h2>
                <p className="text-gray-500 text-center max-w-md text-sm">
                  Protect your rights. Ask about maintenance, illegal rent increases, privacy violations, or how to file with the LTB.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-violet-600" />
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-gray-100/80 border border-gray-200 text-gray-900 rounded-bl-sm'
                      }`}>
                        {message.content}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.role === 'assistant' && (
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => handleCopyMessage(message.id, message.content)}
                          >
                            {copiedMessageId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
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
                          <span className="text-sm text-gray-500">Reviewing RTA protocols...</span>
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
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe your situation (e.g., Landlord won't fix my leaking sink)..."
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

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-gray-200 px-4 py-6 space-y-6">

          {/* Next Best Action */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Next Best Action</h2>
            {selectedForm ? (() => {
              const theme = formColorTheme[selectedForm] ?? formColorTheme['t2'];
              const form = commonTenantForms.find(f => f.id === selectedForm);
              return (
                <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} overflow-hidden`}>
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className={`h-4 w-4 flex-shrink-0 ${theme.text}`} />
                      <p className={`text-sm font-bold ${theme.text}`}>
                        File Form {form?.formType}
                      </p>
                    </div>
                    <p className={`text-xs leading-snug ${theme.subtext}`}>
                      {form?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/forms/${selectedForm}`)}
                    className={`w-full flex items-center justify-between px-4 py-3 ${theme.btn} ${theme.btnHover} transition-colors text-left`}
                  >
                    <span className="text-sm font-bold text-white">Start Application →</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              );
            })() : (
              <p className="text-xs text-gray-500">Select a case type above.</p>
            )}
          </div>

          {/* Required Forms */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Required Forms</h2>
            <p className="text-sm text-gray-800">
              {selectedForm
                ? `Form ${commonTenantForms.find(f => f.id === selectedForm)?.formType} — ${commonTenantForms.find(f => f.id === selectedForm)?.description}`
                : 'Waiting for selection...'}
            </p>
          </div>

          {/* Mistakes to Avoid */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Mistakes to Avoid</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-800">• Don't use email unless consent is in writing.</p>
              <p className="text-sm text-gray-800">• Don't count the day of service in the notice period.</p>
              <p className="text-sm text-gray-800">• Ensure all tenant names match the lease exactly.</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800">
              Timelines are estimates only. LTB delays typically range 4–8 months. Not legal advice.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
