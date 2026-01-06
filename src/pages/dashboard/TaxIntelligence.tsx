import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Tabs removed - now using unified form
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    History,
    Send,
    Bot,
    User,
    Loader2,
    Copy,
    Check,
    AlertTriangle,
    Sparkles,
    PiggyBank,
    Receipt,
    Building2,
    Hammer,
    Pencil,
    Trash2,
    FileText,
    Info,
    RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { taxIntelligenceService, TaxEntry as DbTaxEntry } from "@/services/taxIntelligenceService";

// Types - Map database format to component format
interface TaxEntry {
    id: string;
    date: string;
    role: 'operator' | 'renovator';
    rent: number;
    otherIncome: number;
    renovation: number;
    otherExpense: number;
}

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

// Province options for tax logic
const PROVINCES = [
    'Ontario',
    'British Columbia',
    'Alberta',
    'Quebec',
    'Manitoba',
    'Saskatchewan',
    'Nova Scotia',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Prince Edward Island'
];

// Provincial tax rates (placeholder - would be more complex in production)
const PROVINCE_TAX_RATES: Record<string, number> = {
    'Ontario': 0.122,
    'British Columbia': 0.12,
    'Alberta': 0.08,
    'Quebec': 0.14,
    'Manitoba': 0.12,
    'Saskatchewan': 0.11,
    'Nova Scotia': 0.13,
    'New Brunswick': 0.13,
    'Newfoundland and Labrador': 0.14,
    'Prince Edward Island': 0.13
};

// Quick prompt chips for AI
const AI_CHIPS = [
    { label: "Tax exposure forecast", prompt: "What is my tax exposure if I keep this pace?" },
    { label: "Tax reserve", prompt: "How much should I reserve today for tax?" },
    { label: "Classify renovation", prompt: "Does my renovation look like a repair or a capital improvement?" },
    { label: "Year-end spend idea", prompt: "Suggest year-end spend to reduce tax." }
];

// Helper functions
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

const getTodayISO = (): string => {
    return new Date().toISOString().slice(0, 10);
};

// Map database entry to component format
const mapDbEntryToLocal = (dbEntry: DbTaxEntry): TaxEntry => ({
    id: dbEntry.id,
    date: dbEntry.entry_date,
    role: dbEntry.role,
    rent: dbEntry.rent,
    otherIncome: dbEntry.other_income,
    renovation: dbEntry.renovation,
    otherExpense: dbEntry.other_expense
});

// Formatted AI Message Component
const FormattedMessage = ({ content }: { content: string }) => {
    const paragraphs = content.split('\n');

    return (
        <div className="space-y-1.5">
            {paragraphs.map((line, i) => {
                if (!line.trim()) {
                    return <div key={i} className="h-2" />;
                }

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

export default function TaxIntelligencePage() {
    const { toast } = useToast();
    const { role: userRole } = useRole();

    // State
    const [selectedRole, setSelectedRole] = useState<'operator' | 'renovator'>(
        userRole === 'renovator' ? 'renovator' : 'operator'
    );
    const [province, setProvince] = useState('Ontario');
    const [entries, setEntries] = useState<TaxEntry[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Income form state
    const [incomeDate, setIncomeDate] = useState(getTodayISO());
    const [rent, setRent] = useState<string>('');
    const [otherIncome, setOtherIncome] = useState<string>('');

    // Expense form state
    const [expenseDate, setExpenseDate] = useState(getTodayISO());
    const [renovation, setRenovation] = useState<string>('');
    const [otherExpense, setOtherExpense] = useState<string>('');

    // AI Chat state
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Enter today's Income and Expenses. I will summarize the net impact and highlight any classification questions (e.g., renovation: repair vs improvement).",
            role: 'assistant',
            timestamp: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    // Edit entry state
    const [editingEntry, setEditingEntry] = useState<TaxEntry | null>(null);
    const [editRent, setEditRent] = useState('');
    const [editOtherIncome, setEditOtherIncome] = useState('');
    const [editRenovation, setEditRenovation] = useState('');
    const [editOtherExpense, setEditOtherExpense] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Calculate today's totals
    const getTodayTotals = () => {
        const today = getTodayISO();
        const todayEntry = entries.find(e => e.date === today);

        const rentAmount = todayEntry?.rent || 0;
        const otherIncomeAmount = todayEntry?.otherIncome || 0;
        const renovationAmount = todayEntry?.renovation || 0;
        const otherExpenseAmount = todayEntry?.otherExpense || 0;

        const income = rentAmount + otherIncomeAmount;
        const expense = renovationAmount + otherExpenseAmount;
        const net = income - expense;
        const taxRate = PROVINCE_TAX_RATES[province] || 0.122;
        const tax = Math.max(0, net) * taxRate;

        return {
            income,
            expense,
            net,
            tax,
            rent: rentAmount,
            otherIncome: otherIncomeAmount,
            renovation: renovationAmount,
            otherExpense: otherExpenseAmount
        };
    };

    const totals = getTodayTotals();

    // Check if we have valid data to show report (both income AND expense must be entered)
    const hasValidDataForReport = totals.income > 0 && totals.expense > 0;

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // LocalStorage key for offline persistence
    const STORAGE_KEY = 'tax_intelligence_entries';

    // Load entries from localStorage
    const loadFromLocalStorage = (): TaxEntry[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error loading from localStorage:', e);
        }
        return [];
    };

    // Save entries to localStorage
    const saveToLocalStorage = (entriesToSave: TaxEntry[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesToSave));
        } catch (e) {
            console.warn('Error saving to localStorage:', e);
        }
    };

    // Load entries from Supabase, fallback to localStorage
    const loadEntries = useCallback(async () => {
        try {
            setIsLoading(true);
            const dbEntries = await taxIntelligenceService.getEntries();
            if (dbEntries.length > 0) {
                const localEntries = dbEntries.map(mapDbEntryToLocal);
                setEntries(localEntries);
                // Also sync to localStorage as backup
                saveToLocalStorage(localEntries);
            } else {
                // No DB entries, try localStorage
                const storedEntries = loadFromLocalStorage();
                setEntries(storedEntries);
            }
        } catch (error) {
            // Database failed - load from localStorage
            console.warn('Could not load from database, using localStorage:', error);
            const storedEntries = loadFromLocalStorage();
            setEntries(storedEntries);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save to localStorage whenever entries change
    useEffect(() => {
        if (entries.length > 0) {
            saveToLocalStorage(entries);
        }
    }, [entries]);

    // Load entries on mount
    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // Save income entry
    const handleSaveIncome = async () => {
        const rentVal = parseFloat(rent) || 0;
        const otherVal = parseFloat(otherIncome) || 0;

        if (rentVal === 0 && otherVal === 0) {
            toast({
                variant: "destructive",
                title: "No Income Entered",
                description: "Please enter at least one income amount."
            });
            return;
        }

        try {
            setIsSaving(true);
            await taxIntelligenceService.saveIncome(incomeDate, rentVal, otherVal, selectedRole, province);
            await loadEntries(); // Reload from database

            addAIMessage("Saved income entry. I updated today's totals and tax reserve estimate.");

            toast({
                title: "Income Saved",
                description: `Income of ${formatCurrency(rentVal + otherVal)} saved for ${incomeDate}.`
            });

            // Clear form
            setRent('');
            setOtherIncome('');
        } catch (error) {
            console.error('Error saving income:', error);
            toast({
                variant: "destructive",
                title: "Error Saving Income",
                description: "Could not save your income entry. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Save expense entry
    const handleSaveExpense = async () => {
        const renovationVal = parseFloat(renovation) || 0;
        const otherVal = parseFloat(otherExpense) || 0;

        if (renovationVal === 0 && otherVal === 0) {
            toast({
                variant: "destructive",
                title: "No Expense Entered",
                description: "Please enter at least one expense amount."
            });
            return;
        }

        try {
            setIsSaving(true);
            await taxIntelligenceService.saveExpense(expenseDate, renovationVal, otherVal, selectedRole, province);
            await loadEntries(); // Reload from database

            if (renovationVal > 0) {
                addAIMessage("Saved expense entry. Note: renovation may be repair/maintenance or capital improvement. If you describe the work, I can classify the tax impact more accurately.");
            } else {
                addAIMessage("Saved expense entry. I updated today's totals and tax reserve estimate.");
            }

            toast({
                title: "Expense Saved",
                description: `Expense of ${formatCurrency(renovationVal + otherVal)} saved for ${expenseDate}.`
            });

            // Clear form
            setRenovation('');
            setOtherExpense('');
        } catch (error) {
            console.error('Error saving expense:', error);
            toast({
                variant: "destructive",
                title: "Error Saving Expense",
                description: "Could not save your expense entry. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Combined save - saves both income and expenses
    const handleSaveEntry = async () => {
        const rentVal = parseFloat(rent) || 0;
        const otherIncomeVal = parseFloat(otherIncome) || 0;
        const renovationVal = parseFloat(renovation) || 0;
        const otherExpenseVal = parseFloat(otherExpense) || 0;

        const totalIncome = rentVal + otherIncomeVal;
        const totalExpense = renovationVal + otherExpenseVal;

        if (totalIncome === 0 && totalExpense === 0) {
            toast({
                variant: "destructive",
                title: "No Data Entered",
                description: "Please enter at least one income or expense amount."
            });
            return;
        }

        try {
            setIsSaving(true);

            // Try to save to Supabase first
            try {
                await taxIntelligenceService.upsertEntry({
                    entry_date: incomeDate,
                    role: selectedRole,
                    province: province,
                    rent: rentVal,
                    other_income: otherIncomeVal,
                    renovation: renovationVal,
                    other_expense: otherExpenseVal
                });
                await loadEntries(); // Reload from database
            } catch (dbError) {
                // Fallback to local state if database table doesn't exist
                console.warn('Database save failed, using local state:', dbError);

                const existingIndex = entries.findIndex(e => e.date === incomeDate);
                const newEntry: TaxEntry = {
                    id: existingIndex >= 0 ? entries[existingIndex].id : Date.now().toString(),
                    date: incomeDate,
                    role: selectedRole,
                    rent: rentVal,
                    otherIncome: otherIncomeVal,
                    renovation: renovationVal,
                    otherExpense: otherExpenseVal
                };

                if (existingIndex >= 0) {
                    setEntries(prev => prev.map((e, i) => i === existingIndex ? newEntry : e));
                } else {
                    setEntries(prev => [...prev, newEntry]);
                }
            }

            // Generate appropriate AI message
            if (totalIncome > 0 && totalExpense > 0) {
                addAIMessage("Entry saved with both income and expenses. Tax report generated below.");
            } else if (totalIncome > 0) {
                addAIMessage("Income entry saved. Add expenses to generate the full tax report.");
            } else {
                addAIMessage("Expense entry saved. Add income to generate the full tax report.");
            }

            toast({
                title: "Entry Saved",
                description: `Saved for ${incomeDate}: Income ${formatCurrency(totalIncome)}, Expenses ${formatCurrency(totalExpense)}`
            });

            // Clear form
            setRent('');
            setOtherIncome('');
            setRenovation('');
            setOtherExpense('');
        } catch (error) {
            console.error('Error saving entry:', error);
            toast({
                variant: "destructive",
                title: "Error Saving Entry",
                description: "Could not save your entry. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Prefill all example data
    const handlePrefillAll = () => {
        setRent('8000');
        setOtherIncome('500');
        setRenovation('4000');
        setOtherExpense('2000');
    };

    // Clear all forms
    const handleClearAll = () => {
        setRent('');
        setOtherIncome('');
        setRenovation('');
        setOtherExpense('');
    };

    // Legacy individual handlers (kept for compatibility)
    const handlePrefillIncome = () => {
        setRent('8000');
        setOtherIncome('500');
    };

    const handlePrefillExpense = () => {
        setRenovation('4000');
        setOtherExpense('2000');
    };

    const handleClearIncome = () => {
        setRent('');
        setOtherIncome('');
    };

    const handleClearExpense = () => {
        setRenovation('');
        setOtherExpense('');
    };

    // Clear history
    const handleClearHistory = async () => {
        try {
            setIsSaving(true);
            await taxIntelligenceService.clearAllEntries();
            setEntries([]);
            addAIMessage("History cleared.");
            toast({
                title: "History Cleared",
                description: "All entries have been removed."
            });
        } catch (error) {
            console.error('Error clearing history:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not clear history. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Start editing an entry
    const handleEditEntry = (entry: TaxEntry) => {
        setEditingEntry(entry);
        setEditRent(entry.rent.toString());
        setEditOtherIncome(entry.otherIncome.toString());
        setEditRenovation(entry.renovation.toString());
        setEditOtherExpense(entry.otherExpense.toString());
    };

    // Save edited entry
    const handleSaveEditedEntry = async () => {
        if (!editingEntry) return;

        try {
            setIsSaving(true);
            await taxIntelligenceService.updateEntry(editingEntry.id, {
                rent: parseFloat(editRent) || 0,
                other_income: parseFloat(editOtherIncome) || 0,
                renovation: parseFloat(editRenovation) || 0,
                other_expense: parseFloat(editOtherExpense) || 0
            });

            await loadEntries(); // Reload from database
            setEditingEntry(null);

            toast({
                title: "Entry Updated",
                description: `Entry for ${editingEntry.date} has been updated.`
            });

            addAIMessage("Entry updated. I recalculated today's totals and tax reserve estimate.");
        } catch (error) {
            console.error('Error updating entry:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update entry. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Delete an entry
    const handleDeleteEntry = async (entryId: string) => {
        const entry = entries.find(e => e.id === entryId);

        try {
            setIsSaving(true);
            await taxIntelligenceService.deleteEntry(entryId);
            setEntries(prev => prev.filter(e => e.id !== entryId));

            toast({
                title: "Entry Deleted",
                description: entry ? `Entry for ${entry.date} has been removed.` : "Entry removed."
            });
        } catch (error) {
            console.error('Error deleting entry:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete entry. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingEntry(null);
        setEditRent('');
        setEditOtherIncome('');
        setEditRenovation('');
        setEditOtherExpense('');
    };

    // Add AI message
    const addAIMessage = (prefix: string) => {
        const t = getTodayTotals();
        const roleLabel = selectedRole === 'renovator' ? 'Renovator' : 'Property Operator';
        const reno = t.renovation;
        const taxRate = PROVINCE_TAX_RATES[province] || 0.122;

        let content = `**AI:** ${prefix}\n\n`;
        content += `**Today snapshot** (${roleLabel}, ${province}):\n`;
        content += `• Income: **${formatCurrency(t.income)}** (Rent ${formatCurrency(t.rent)} + Other ${formatCurrency(t.otherIncome)})\n`;
        content += `• Expenses: **${formatCurrency(t.expense)}** (Renovation ${formatCurrency(reno)} + Other ${formatCurrency(t.otherExpense)})\n`;
        content += `• Net profit impact: **${formatCurrency(t.net)}**\n`;
        content += `• Estimated tax reserve (${(taxRate * 100).toFixed(1)}%): **${formatCurrency(t.tax)}**`;

        if (reno > 0) {
            content += `\n\n**Classification check:**\nRenovation may be **repair/maintenance** (often deductible now) or a **capital improvement** (often deducted over time). Describe the work to improve accuracy.`;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            content,
            role: 'assistant',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
    };

    // Handle user prompt
    const handleUserPrompt = async (prompt: string) => {
        if (!prompt.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: prompt,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsAILoading(true);

        // Simulate AI response (in production, this would call your AI backend)
        setTimeout(() => {
            const t = getTodayTotals();
            const p = prompt.toLowerCase();
            let response = '';

            if (p.includes('pace') || p.includes('forecast') || p.includes('exposure')) {
                response = `**AI:** If you keep today's net pace (${formatCurrency(t.net)} net), your liability depends on how many similar days occur before year-end. In production, I will project using your 30/60/90-day history and seasonality, then show a year-end tax range with assumptions.`;
            } else if (p.includes('reserve')) {
                const taxRate = PROVINCE_TAX_RATES[province] || 0.122;
                response = `**AI:** Based on today's net (${formatCurrency(t.net)}), your estimated tax reserve is **${formatCurrency(Math.max(0, t.net) * taxRate)}**. In production, this changes by province, CCPC status, and deductions classification.`;
            } else if (p.includes('classify') || p.includes('renovation') || p.includes('repair') || p.includes('capital')) {
                if (t.renovation <= 0) {
                    response = `**AI:** I don't see a renovation amount entered today. Add it under Expenses, then I can guide classification.`;
                } else {
                    response = `**AI:** You entered ${formatCurrency(t.renovation)} renovation. Quick question: was this (A) repairs/maintenance (paint, patch, replace broken items) or (B) improvement (new kitchen, structural upgrade, value-add)? Your answer changes the year-end deduction timing.`;
                }
            } else if (p.includes('year-end') || p.includes('spend')) {
                response = `**AI:** Year-end spend suggestions should be business-driven and well-documented. In production, I will rank options (repairs/maintenance, software, marketing, professional fees) and compute "Spend $X → estimated tax saved $Y" using your marginal rate and deductibility rules.`;
            } else {
                addAIMessage("Here is what I can infer based on your current entries.");
                setIsAILoading(false);
                return;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsAILoading(false);
        }, 1000);
    };

    // Copy message to clipboard
    const copyToClipboard = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content.replace(/\*\*/g, ''));
            setCopiedMessageId(messageId);
            toast({ title: "Copied!", description: "Message copied to clipboard." });
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to copy." });
        }
    };

    // Handle Enter key in chat
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserPrompt(chatInput);
        }
    };

    // Role badge text
    const getRoleBadge = () => {
        return selectedRole === 'renovator' ? 'Renovator' : 'Property Operator';
    };

    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Calculator className="h-8 w-8 text-emerald-600" />
                            Tax Intelligence
                            {(isLoading || isSaving) && (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            )}
                        </h1>
                        <p className="text-muted-foreground">
                            Role-based Income / Expense capture with history and AI-powered tax explanations.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500">
                                {entries.length} entries saved
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadEntries}
                                disabled={isLoading}
                                className="h-6 px-2"
                            >
                                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-[220px]">
                            <Label className="text-xs text-muted-foreground mb-2 block">Role</Label>
                            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'operator' | 'renovator')}>
                                <SelectTrigger className="bg-slate-50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="operator">Property Operator (Landlord / Realtor)</SelectItem>
                                    <SelectItem value="renovator">Renovator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-[220px]">
                            <Label className="text-xs text-muted-foreground mb-2 block">Province (for tax logic)</Label>
                            <Select value={province} onValueChange={setProvince}>
                                <SelectTrigger className="bg-slate-50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROVINCES.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Daily Input */}
                <div className="lg:col-span-8">
                    <Card className="shadow-md border border-slate-200 overflow-hidden">
                        <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-slate-600" />
                                        Daily Input
                                    </CardTitle>
                                    <CardDescription>
                                        Enter income and expenses for a day; the system keeps history.
                                    </CardDescription>
                                </div>
                                <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                                    Today: {getTodayISO()}
                                </span>
                            </div>
                        </CardHeader>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gradient-to-b from-slate-50 to-white">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    Income (Today)
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatCurrency(totals.income)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Rent + Other income</div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                    Expenses (Today)
                                </div>
                                <div className="text-xl font-bold text-red-600">
                                    {formatCurrency(totals.expense)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Renovation + Other expenses</div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 text-blue-500" />
                                    Net (Today)
                                </div>
                                <div className={`text-xl font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(totals.net)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Income − Expenses</div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <PiggyBank className="h-3 w-3 text-amber-500" />
                                    Est. Tax Reserve
                                </div>
                                <div className="text-xl font-bold text-amber-600">
                                    {formatCurrency(totals.tax)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    ~{((PROVINCE_TAX_RATES[province] || 0.122) * 100).toFixed(1)}% {province.slice(0, 2).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Unified Entry Form */}
                        <div className="p-4 space-y-4">
                            {/* Date Selection */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="entryDate" className="text-sm font-medium">Entry Date</Label>
                                        <p className="text-xs text-muted-foreground mt-1">Select the date for this entry</p>
                                    </div>
                                    <Input
                                        id="entryDate"
                                        type="date"
                                        value={incomeDate}
                                        onChange={(e) => {
                                            setIncomeDate(e.target.value);
                                            setExpenseDate(e.target.value); // Keep in sync
                                        }}
                                        className="w-44 bg-white"
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {/* Income & Expenses Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Income Section */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-800">Income</h3>
                                            <p className="text-xs text-green-600">Money coming in</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="rent" className="text-sm font-medium text-green-800">Rent ($)</Label>
                                            <Input
                                                id="rent"
                                                type="number"
                                                placeholder="e.g., 8000"
                                                value={rent}
                                                onChange={(e) => setRent(e.target.value)}
                                                className="mt-1 bg-white border-green-200 focus:border-green-400"
                                                min="0"
                                                step="0.01"
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="otherIncome" className="text-sm font-medium text-green-800">Other Income ($)</Label>
                                            <Input
                                                id="otherIncome"
                                                type="number"
                                                placeholder="e.g., 500 (commission, fees)"
                                                value={otherIncome}
                                                onChange={(e) => setOtherIncome(e.target.value)}
                                                className="mt-1 bg-white border-green-200 focus:border-green-400"
                                                min="0"
                                                step="0.01"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-green-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-green-700">Total Income</span>
                                            <span className="text-lg font-bold text-green-600">
                                                {formatCurrency((parseFloat(rent) || 0) + (parseFloat(otherIncome) || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses Section */}
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-800">Expenses</h3>
                                            <p className="text-xs text-red-600">Money going out</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="renovation" className="text-sm font-medium text-red-800">Renovation ($)</Label>
                                            <Input
                                                id="renovation"
                                                type="number"
                                                placeholder="e.g., 4000"
                                                value={renovation}
                                                onChange={(e) => setRenovation(e.target.value)}
                                                className="mt-1 bg-white border-red-200 focus:border-red-400"
                                                min="0"
                                                step="0.01"
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="otherExpense" className="text-sm font-medium text-red-800">Other Expenses ($)</Label>
                                            <Input
                                                id="otherExpense"
                                                type="number"
                                                placeholder="e.g., 2000 (utilities, etc.)"
                                                value={otherExpense}
                                                onChange={(e) => setOtherExpense(e.target.value)}
                                                className="mt-1 bg-white border-red-200 focus:border-red-400"
                                                min="0"
                                                step="0.01"
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-red-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-red-700">Total Expenses</span>
                                            <span className="text-lg font-bold text-red-600">
                                                {formatCurrency((parseFloat(renovation) || 0) + (parseFloat(otherExpense) || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveEntry}
                                        className="bg-emerald-600 hover:bg-emerald-700 px-6"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Save Entry & Generate Report
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handlePrefillAll} disabled={isSaving} size="sm">
                                        Prefill Example
                                    </Button>
                                    <Button variant="outline" onClick={handleClearAll} disabled={isSaving} size="sm">
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* History Section - Always Visible */}
                        <div className="border-t border-slate-200">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-slate-600" />
                                        <h3 className="font-semibold text-slate-800">Entry History</h3>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                            {entries.length} entries
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearHistory}
                                        disabled={isSaving || entries.length === 0}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Clear All
                                    </Button>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Rent</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Other Inc.</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Reno</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Other Exp.</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-600">Net</th>
                                                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entries.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <FileText className="h-8 w-8 text-slate-300" />
                                                                <span>No entries yet. Fill in the form above and save.</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    entries
                                                        .sort((a, b) => b.date.localeCompare(a.date))
                                                        .slice(0, 5) // Show only last 5 entries
                                                        .map((entry) => {
                                                            const income = entry.rent + entry.otherIncome;
                                                            const expense = entry.renovation + entry.otherExpense;
                                                            const net = income - expense;
                                                            return (
                                                                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                                    <td className="px-3 py-2 text-xs">{entry.date}</td>
                                                                    <td className="px-3 py-2">
                                                                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs">
                                                                            {entry.role === 'renovator' ? 'Reno' : 'Op'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right text-xs">{formatCurrency(entry.rent)}</td>
                                                                    <td className="px-3 py-2 text-right text-xs">{formatCurrency(entry.otherIncome)}</td>
                                                                    <td className="px-3 py-2 text-right text-xs">{formatCurrency(entry.renovation)}</td>
                                                                    <td className="px-3 py-2 text-right text-xs">{formatCurrency(entry.otherExpense)}</td>
                                                                    <td className={`px-3 py-2 text-right text-xs font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {formatCurrency(net)}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 w-7 p-0 hover:bg-blue-50"
                                                                                onClick={() => handleEditEntry(entry)}
                                                                                disabled={isSaving}
                                                                            >
                                                                                <Pencil className="h-3 w-3 text-blue-600" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 w-7 p-0 hover:bg-red-50"
                                                                                onClick={() => handleDeleteEntry(entry.id)}
                                                                                disabled={isSaving}
                                                                            >
                                                                                <Trash2 className="h-3 w-3 text-red-600" />
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {entries.length > 5 && (
                                        <div className="p-2 text-center bg-slate-50 border-t border-slate-200">
                                            <span className="text-xs text-slate-500">
                                                Showing 5 of {entries.length} entries
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Panel: AI Advisor */}
                <div className="lg:col-span-4">
                    <Card className="shadow-md border border-slate-200 h-full flex flex-col">
                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-600" />
                                        AI Advisor
                                    </CardTitle>
                                    <CardDescription>
                                        Uses saved entries to explain what's happening and suggest next steps.
                                    </CardDescription>
                                </div>
                                <span className="px-3 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full text-xs font-medium text-indigo-700">
                                    {getRoleBadge()}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col p-4 space-y-4">
                            {/* Summary */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-muted-foreground">Selected role</span>
                                    <span className="font-semibold">
                                        {selectedRole === 'renovator' ? 'Renovator' : 'Property Operator (Landlord / Realtor)'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-muted-foreground">Today income</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(totals.income)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1 border-b border-dashed border-slate-200">
                                    <span className="text-muted-foreground">Today expenses</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(totals.expense)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="text-muted-foreground">Estimated tax reserve</span>
                                    <span className="font-semibold text-amber-600">{formatCurrency(totals.tax)}</span>
                                </div>
                            </div>

                            {/* Chat Box */}
                            <div
                                ref={chatBoxRef}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-y-auto min-h-[280px] max-h-[400px] space-y-3"
                            >
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`p-3 rounded-xl text-sm ${message.role === 'user'
                                            ? 'bg-emerald-50 border border-emerald-200'
                                            : 'bg-blue-50 border border-blue-200'
                                            }`}
                                    >
                                        <FormattedMessage content={message.role === 'user' ? `**You:** ${message.content}` : message.content} />
                                        {message.role === 'assistant' && (
                                            <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
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
                                ))}

                                {isAILoading && (
                                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                            <span className="text-sm text-blue-600">Analyzing your data...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompt Chips */}
                            <div className="flex flex-wrap gap-2">
                                {AI_CHIPS.map((chip) => (
                                    <button
                                        key={chip.label}
                                        onClick={() => handleUserPrompt(chip.prompt)}
                                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                        disabled={isAILoading}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <div className="flex gap-2 items-end">
                                <Textarea
                                    placeholder="Ask the AI..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="min-h-[46px] max-h-[100px] resize-none bg-white"
                                    disabled={isAILoading}
                                />
                                <Button
                                    onClick={() => handleUserPrompt(chatInput)}
                                    disabled={!chatInput.trim() || isAILoading}
                                    className="h-[46px] px-4"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800">
                                    <strong>Disclaimer:</strong> Estimates only. Not tax filing advice. In production, apply province rates, CCPC logic, and deductibility rules with audit-safe explanations.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ===== TAX REPORT SECTION ===== */}
            {hasValidDataForReport ? (
                <div className="mt-8 space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <Receipt className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Tax Intelligence Report</h2>
                            <p className="text-sm text-muted-foreground">Detailed breakdown, strategies, and deductible expenses</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tax Calculation Breakdown */}
                        <Card className="shadow-lg border-0 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Tax Calculation Breakdown
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    How your estimated tax is calculated
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {/* Income Breakdown */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Total Income (Today)
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Rental Income</span>
                                            <span className="font-semibold text-green-700">{formatCurrency(totals.rent)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Other Income (Commission/Fees)</span>
                                            <span className="font-semibold text-green-700">{formatCurrency(totals.otherIncome)}</span>
                                        </div>
                                        <div className="border-t border-green-300 pt-2 flex justify-between">
                                            <span className="font-semibold text-slate-700">Gross Income</span>
                                            <span className="font-bold text-green-600 text-lg">{formatCurrency(totals.income)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expense Breakdown */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        Total Deductions (Today)
                                    </h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Renovation/Repairs</span>
                                            <span className="font-semibold text-red-700">-{formatCurrency(totals.renovation)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Other Expenses</span>
                                            <span className="font-semibold text-red-700">-{formatCurrency(totals.otherExpense)}</span>
                                        </div>
                                        <div className="border-t border-red-300 pt-2 flex justify-between">
                                            <span className="font-semibold text-slate-700">Total Deductions</span>
                                            <span className="font-bold text-red-600 text-lg">-{formatCurrency(totals.expense)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net & Tax */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-700">Taxable Income (Net)</span>
                                        <span className={`font-bold text-xl ${totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {formatCurrency(totals.net)}
                                        </span>
                                    </div>
                                    <div className="border-t border-blue-200 pt-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold text-slate-700">Estimated Tax</span>
                                                <p className="text-xs text-slate-500">@ {((PROVINCE_TAX_RATES[province] || 0.122) * 100).toFixed(1)}% ({province})</p>
                                            </div>
                                            <span className="font-bold text-2xl text-amber-600">{formatCurrency(totals.tax)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-100 rounded-lg p-3 text-xs text-slate-600">
                                    <strong>Note:</strong> This is a simplified estimate. Actual tax calculations consider marginal rates, CCPC status, personal tax credits, and other factors.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tax Reduction Strategies - Role Specific */}
                        <Card className="shadow-lg border-0 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PiggyBank className="h-5 w-5" />
                                    How to Reduce Your Tax
                                </CardTitle>
                                <CardDescription className="text-emerald-100">
                                    {selectedRole === 'renovator'
                                        ? 'Deductible expenses for renovators & contractors'
                                        : 'Deductible expenses for landlords & realtors'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {selectedRole === 'operator' ? (
                                    // === LANDLORD / REALTOR SPECIFIC DEDUCTIONS ===
                                    <>
                                        {/* Landlord Section */}
                                        <div className="bg-white border-2 border-emerald-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-emerald-800">If You're a LANDLORD</h5>
                                                    <p className="text-xs text-emerald-600">Reduce taxes by spending on these items:</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">🏠 Property Operating Costs</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Mortgage interest (not principal payments)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Property tax payments</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Property insurance premiums</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Condo/strata fees</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Utilities (heat, water, hydro if you pay)</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">🔧 Repairs & Maintenance</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Plumbing repairs (leaky faucets, pipes)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Electrical fixes (outlets, switches)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Painting & patching walls</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Appliance repairs</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Landscaping, snow removal</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">💼 Professional Services</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Property management fees</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Legal fees (leases, evictions)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Accounting fees for rental income</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Tenant screening costs</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">📢 Marketing & Admin</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Rental listing ads (Kijiji, etc.)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Mileage to visit properties</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Office supplies & banking fees</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Property management software</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                <p className="text-sm text-emerald-800">
                                                    <strong>💡 Landlord Tip:</strong> Every $1,000 in deductible expenses saves you ~<strong>${(1000 * (PROVINCE_TAX_RATES[province] || 0.122)).toFixed(0)}</strong> in taxes ({province}).
                                                </p>
                                            </div>
                                        </div>

                                        {/* Realtor Section */}
                                        <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-blue-800">If You're a REALTOR</h5>
                                                    <p className="text-xs text-blue-600">Deduct these business expenses from commission income:</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">🚗 Vehicle & Transportation</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Vehicle lease or loan interest</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Gas & fuel for showings</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Car insurance (business %)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Vehicle repairs & maintenance</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Parking fees for client meetings</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">📱 Technology & Equipment</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Cell phone bill (business %)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Laptop, tablet, camera</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> MLS fees & software subscriptions</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Website hosting & domain</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> CRM software (Follow Up Boss, etc.)</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">📣 Marketing & Advertising</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Online ads (Facebook, Google)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Print materials (business cards, flyers)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Professional photography</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Staging costs & virtual tours</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Open house expenses</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h6 className="font-semibold text-sm text-slate-700 mb-2">🏢 Office & Professional</h6>
                                                    <ul className="space-y-1.5 text-sm text-slate-600">
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Brokerage desk fees</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Real estate board dues (CREA, local)</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> E&O insurance</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Continuing education courses</li>
                                                        <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Client gifts (max $500/person)</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <p className="text-sm text-blue-800">
                                                    <strong>💡 Realtor Tip:</strong> Track EVERY business expense. A $10,000 marketing spend saves ~<strong>${(10000 * (PROVINCE_TAX_RATES[province] || 0.122)).toFixed(0)}</strong> in taxes.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // === RENOVATOR SPECIFIC DEDUCTIONS ===
                                    <div className="bg-white border-2 border-emerald-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Hammer className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-orange-800">RENOVATOR Tax Deductions</h5>
                                                <p className="text-xs text-orange-600">Deduct these from your renovation/contractor income:</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h6 className="font-semibold text-sm text-slate-700 mb-2">🔨 Tools & Equipment</h6>
                                                <ul className="space-y-1.5 text-sm text-slate-600">
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Power tools (drills, saws, sanders)</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Hand tools & hardware</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Ladders, scaffolding</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Safety gear (helmets, glasses, gloves)</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Work boots & clothing</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-sm text-slate-700 mb-2">🚐 Vehicle & Transport</h6>
                                                <ul className="space-y-1.5 text-sm text-slate-600">
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Work truck/van payments</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Gas & fuel to job sites</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Vehicle insurance (business %)</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Trailer expenses</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Equipment rental delivery</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-sm text-slate-700 mb-2">📦 Materials & Supplies</h6>
                                                <ul className="space-y-1.5 text-sm text-slate-600">
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Lumber, drywall, flooring</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Paint, stain, finishes</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Plumbing & electrical supplies</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Fasteners, adhesives</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Disposal & dump fees</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h6 className="font-semibold text-sm text-slate-700 mb-2">💼 Business Expenses</h6>
                                                <ul className="space-y-1.5 text-sm text-slate-600">
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Liability insurance</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> WSIB premiums</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Trade licenses & permits</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Phone & internet</li>
                                                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Accounting & legal fees</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                                            <p className="text-sm text-orange-800">
                                                <strong>💡 Renovator Tip:</strong> Keep ALL receipts from Home Depot, Lowe's, etc. A $5,000 tool purchase saves ~<strong>${(5000 * (PROVINCE_TAX_RATES[province] || 0.122)).toFixed(0)}</strong> in taxes.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Deductible Expenses List */}
                        <Card className="shadow-lg border-0 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    Deductible Expenses
                                </CardTitle>
                                <CardDescription className="text-indigo-100">
                                    {selectedRole === 'renovator' ? 'Expenses renovators can deduct' : 'Expenses landlords/realtors can deduct'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5">
                                {selectedRole === 'renovator' ? (
                                    // Renovator Expenses
                                    <div className="space-y-4">
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                                                <Hammer className="h-4 w-4" />
                                                Tools & Equipment
                                            </h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Power tools (drills, saws, etc.)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Hand tools & hardware
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Safety equipment (helmets, glasses)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Work clothing & boots
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3">Vehicle & Travel</h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Vehicle expenses (gas, repairs)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Mileage to job sites
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Trailer/van for equipment
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3">Business Operations</h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Business insurance
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Phone & internet
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Software subscriptions
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Advertising & marketing
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Accounting fees
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    // Landlord/Realtor Expenses
                                    <div className="space-y-4">
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Property Operating Costs
                                            </h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Mortgage interest (not principal)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Property taxes
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Property insurance
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Utilities (if landlord pays)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Condo fees
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3">Repairs & Maintenance</h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Plumbing repairs
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Electrical repairs
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Painting & touch-ups
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Appliance repairs
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Landscaping/snow removal
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-indigo-700 mb-3">Professional & Admin</h5>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Property management fees
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Legal fees (lease, evictions)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Accounting fees
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Advertising for tenants
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Software (property mgmt apps)
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    Travel to property (mileage)
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Year-End Action Items */}
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Year-End Tax Optimization Actions
                            </CardTitle>
                            <CardDescription className="text-amber-100">
                                Actions to consider before year-end to legally reduce your tax bill
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                        <Hammer className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h5 className="font-semibold text-slate-800 mb-2">Complete Repairs Now</h5>
                                    <p className="text-sm text-slate-600">
                                        Schedule any pending repairs before Dec 31. Repairs are 100% deductible in the year paid.
                                    </p>
                                    {totals.net > 0 && (
                                        <div className="mt-3 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                            Potential savings: {formatCurrency(totals.net * 0.1 * (PROVINCE_TAX_RATES[province] || 0.122))} if you spend {formatCurrency(totals.net * 0.1)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                        <Receipt className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h5 className="font-semibold text-slate-800 mb-2">Prepay Expenses</h5>
                                    <p className="text-sm text-slate-600">
                                        Consider prepaying insurance, property tax, or supplies for next year to claim this year.
                                    </p>
                                </div>

                                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                        <Calculator className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h5 className="font-semibold text-slate-800 mb-2">Review All Receipts</h5>
                                    <p className="text-sm text-slate-600">
                                        Audit your expenses. Missed deductions are common. Check mileage, home office, phone usage.
                                    </p>
                                </div>

                                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h5 className="font-semibold text-slate-800 mb-2">Set Tax Reserve</h5>
                                    <p className="text-sm text-slate-600">
                                        Based on your data, set aside <strong className="text-amber-700">{formatCurrency(totals.tax)}</strong> for taxes to avoid surprises.
                                    </p>
                                </div>
                            </div>

                            {/* Important Note */}
                            <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-slate-800">Important Disclaimer</h5>
                                    <p className="text-sm text-slate-600 mt-1">
                                        This report provides general guidance only. Tax laws are complex and vary by situation.
                                        Always consult a qualified tax professional (CPA or tax lawyer) before making tax decisions.
                                        The estimates shown here are approximations and should not be relied upon for filing purposes.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* No Data State - Prompt user to enter both income AND expenses */
                <div className="mt-8">
                    <Card className="shadow-lg border-2 border-dashed border-slate-300 bg-slate-50/50">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Tax Report Not Yet Available</h3>
                                <p className="text-slate-500 max-w-md mb-6">
                                    To generate your Tax Intelligence Report, you must enter <strong>both</strong> Income and Expenses for today.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                                    <div className={`p-4 rounded-xl border-2 ${totals.income > 0 ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${totals.income > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                {totals.income > 0 ? (
                                                    <Check className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <TrendingUp className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-semibold ${totals.income > 0 ? 'text-green-700' : 'text-slate-600'}`}>
                                                    {totals.income > 0 ? 'Income Entered' : 'Enter Income'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {totals.income > 0 ? formatCurrency(totals.income) : 'Go to Income tab'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border-2 ${totals.expense > 0 ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${totals.expense > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                {totals.expense > 0 ? (
                                                    <Check className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-semibold ${totals.expense > 0 ? 'text-green-700' : 'text-slate-600'}`}>
                                                    {totals.expense > 0 ? 'Expenses Entered' : 'Enter Expenses'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {totals.expense > 0 ? formatCurrency(totals.expense) : 'Go to Expenses tab'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                                    <Info className="h-4 w-4" />
                                    <span>Both values are required to calculate accurate tax estimates</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Entry Dialog */}
            <Dialog open={!!editingEntry} onOpenChange={(open) => !open && handleCancelEdit()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-600" />
                            Edit Entry - {editingEntry?.date}
                        </DialogTitle>
                        <DialogDescription>
                            Modify the income and expense values for this entry. Changes will update the tax calculations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-green-700 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Income
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editRent">Rent ($)</Label>
                                    <Input
                                        id="editRent"
                                        type="number"
                                        value={editRent}
                                        onChange={(e) => setEditRent(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editOtherIncome">Other Income ($)</Label>
                                    <Input
                                        id="editOtherIncome"
                                        type="number"
                                        value={editOtherIncome}
                                        onChange={(e) => setEditOtherIncome(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-red-700 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4" />
                                Expenses
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editRenovation">Renovation ($)</Label>
                                    <Input
                                        id="editRenovation"
                                        type="number"
                                        value={editRenovation}
                                        onChange={(e) => setEditRenovation(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editOtherExpense">Other Expenses ($)</Label>
                                    <Input
                                        id="editOtherExpense"
                                        type="number"
                                        value={editOtherExpense}
                                        onChange={(e) => setEditOtherExpense(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview of changes */}
                        <div className="bg-slate-50 rounded-lg p-4 mt-2">
                            <h5 className="text-sm font-semibold text-slate-700 mb-2">Preview</h5>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500">Income</p>
                                    <p className="font-bold text-green-600">
                                        {formatCurrency((parseFloat(editRent) || 0) + (parseFloat(editOtherIncome) || 0))}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Expenses</p>
                                    <p className="font-bold text-red-600">
                                        {formatCurrency((parseFloat(editRenovation) || 0) + (parseFloat(editOtherExpense) || 0))}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Net</p>
                                    <p className={`font-bold ${((parseFloat(editRent) || 0) + (parseFloat(editOtherIncome) || 0)) - ((parseFloat(editRenovation) || 0) + (parseFloat(editOtherExpense) || 0)) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(((parseFloat(editRent) || 0) + (parseFloat(editOtherIncome) || 0)) - ((parseFloat(editRenovation) || 0) + (parseFloat(editOtherExpense) || 0)))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEditedEntry} className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
