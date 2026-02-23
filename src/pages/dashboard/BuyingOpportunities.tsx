import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Loader2, Home, DollarSign, Users, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, MessageSquare, Edit2, Plus, Info, Scale, Pencil, PlusCircle, Handshake, HelpCircle, Image as ImageIcon, Eye, TrendingUp, Briefcase, Shield, Search as SearchIcon, Star, User, Calendar, Mail, Wallet, Globe, AlertTriangle, Building2 } from "lucide-react";
import { CoOwnershipForecastModal } from "@/components/dashboard/CoOwnershipForecastModal";
import { fetchAllSalesListings, SalesListing, CoOwnershipSignal, fetchCoOwnershipSignals, createCoOwnershipSignal, updateCoOwnershipSignal } from "@/services/propertyService";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageButton } from "@/components/MessageButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { fetchMortgageProfile, saveMortgageProfile } from "@/services/mortgageProfileService";
import { MortgageProfile, MortgageProfileFormData } from "@/types/mortgage";

const createSignalSchema = z.object({
    capital_available: z.string().min(1, "Capital available is required"),
    household_type: z.enum(["Single", "Couple", "Family", "Investor group"]),
    intended_use: z.enum(["Live-in", "Investment", "Mixed"]),
    time_horizon: z.enum(["1–2 years", "3–5 years", "Flexible"]),
    notes: z.string().optional(),
    disclaimer: z.boolean().refine(val => val === true, "You must agree to the non-binding confirmation"),
});

const mortgageProfileSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    age: z.number().min(18, "Must be at least 18 years old").max(100, "Invalid age").nullable(),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits").nullable(),
    date_of_birth: z.string().optional(),
    first_time_buyer: z.boolean().optional(),
    buying_with_co_borrower: z.boolean().optional(),
    co_borrower_details: z.string().optional(),
    // Employment & Income
    employment_status: z.enum(['employed', 'contractor', 'self_employed']).optional(),
    employment_type: z.enum(['permanent', 'part_time']).optional(),
    employer_name: z.string().optional(),
    client_names: z.array(z.string()).optional(),
    industry: z.string().optional(),
    employment_duration: z.string().optional(),
    contracting_duration: z.string().optional(),
    business_name: z.string().optional(),
    business_duration: z.string().optional(),
    income_range: z.string().optional(),
    variable_income_types: z.array(z.string()).optional(),
    // Assets & Down Payment
    intended_down_payment: z.string().optional(),
    funding_sources: z.array(z.string()).optional(),
    funding_other_explanation: z.string().optional(),
    gift_provider_relationship: z.string().optional(),
    gift_amount_range: z.string().optional(),
    gift_letter_available: z.boolean().optional(),
    liquid_savings_balance: z.string().optional(),
    has_investments: z.string().optional(),
    investment_value_range: z.string().optional(),
    has_cryptocurrency: z.boolean().optional(),
    crypto_storage_type: z.string().optional(),
    crypto_exposure_level: z.string().optional(),
    funds_outside_canada: z.boolean().optional(),
    funds_country_region: z.string().optional(),
    // Credit & Debts
    credit_score_range: z.string().optional(),
    monthly_debt_payments: z.number().optional(),
    debt_credit_cards: z.number().optional(),
    debt_personal_loans: z.number().optional(),
    debt_auto_loans: z.number().optional(),
    debt_student_loans: z.number().optional(),
    debt_other: z.number().optional(),
    missed_payments_last_12_months: z.boolean().optional(),
    missed_payment_type: z.string().optional(),
    missed_payment_count: z.number().optional(),
    last_missed_payment_date: z.string().optional(),
    bankruptcy_proposal_history: z.boolean().optional(),
    bankruptcy_type: z.string().optional(),
    bankruptcy_filing_year: z.string().optional(),
    bankruptcy_discharge_date: z.string().optional(),
    credit_additional_notes: z.string().optional(),
    // Property Intent
    purchase_price_range: z.string().optional(),
    property_type: z.string().optional(),
    intended_use: z.string().optional(),
    target_location: z.string().optional(),
    timeline_to_buy: z.string().optional(),
});

export default function BuyingOpportunitiesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "co-ownership");
    const [salesListings, setSalesListings] = useState<SalesListing[]>([]);
    const [signals, setSignals] = useState<CoOwnershipSignal[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [loadingSignals, setLoadingSignals] = useState(true);
    const [isCreateSignalOpen, setIsCreateSignalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editingSignal, setEditingSignal] = useState<CoOwnershipSignal | null>(null);
    const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
    const [mortgageProfile, setMortgageProfile] = useState<MortgageProfile | null>(null);
    const [loadingMortgageProfile, setLoadingMortgageProfile] = useState(true);
    const [userEmail, setUserEmail] = useState<string>("");
    const [userFullName, setUserFullName] = useState<string>("");
    const { toast } = useToast();

    const form = useForm<z.infer<typeof createSignalSchema>>({
        resolver: zodResolver(createSignalSchema),
        defaultValues: {
            capital_available: "",
            household_type: "Single",
            intended_use: "Live-in",
            time_horizon: "Flexible",
            notes: "",
            disclaimer: false,
        },
    });

    const mortgageForm = useForm<z.infer<typeof mortgageProfileSchema>>({
        resolver: zodResolver(mortgageProfileSchema),
        defaultValues: {
            full_name: "",
            email: "",
            age: 0,
            phone_number: "",
            date_of_birth: "",
            first_time_buyer: false,
            buying_with_co_borrower: false,
            co_borrower_details: "",
            employment_status: undefined,
            employment_type: undefined,
            employer_name: "",
            client_names: [],
            industry: "",
            employment_duration: "",
            contracting_duration: "",
            business_name: "",
            business_duration: "",
            income_range: "",
            variable_income_types: [],
            intended_down_payment: "",
            funding_sources: [],
            funding_other_explanation: "",
            gift_provider_relationship: "",
            gift_amount_range: "",
            gift_letter_available: false,
            liquid_savings_balance: "",
            has_investments: "",
            investment_value_range: "",
            has_cryptocurrency: false,
            crypto_storage_type: "",
            crypto_exposure_level: "",
            funds_outside_canada: false,
            funds_country_region: "",
            credit_score_range: "",
            monthly_debt_payments: 0,
            missed_payments_last_12_months: false,
            bankruptcy_proposal_history: false,
            credit_additional_notes: "",
            purchase_price_range: "",
            property_type: "",
            intended_use: "",
            target_location: "",
            timeline_to_buy: "",
        },
    });

    // Fetch user and profile data
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                setUserEmail(user.email || "");
                
                // Fetch user profile for full name
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setUserFullName(profile.full_name || "");
                }
            }
        };
        getUser();
    }, []);

    // Load mortgage profile when on mortgage-profile tab
    useEffect(() => {
        if (activeTab === 'mortgage-profile' && currentUserId) {
            const loadMortgageProfile = async () => {
                setLoadingMortgageProfile(true);
                try {
                    const profile = await fetchMortgageProfile(currentUserId);
                    setMortgageProfile(profile);
                    
                    if (profile) {
                        mortgageForm.reset({
                            full_name: profile.full_name || userFullName,
                            email: profile.email || userEmail,
                            age: profile.age || 0,
                            phone_number: profile.phone_number || "",
                            date_of_birth: profile.date_of_birth || "",
                            first_time_buyer: profile.first_time_buyer || false,
                            buying_with_co_borrower: profile.buying_with_co_borrower || false,
                            co_borrower_details: profile.co_borrower_details || "",
                            employment_status: profile.employment_status || undefined,
                            employment_type: profile.employment_type || undefined,
                            employer_name: profile.employer_name || "",
                            client_names: profile.client_names || [],
                            industry: profile.industry || "",
                            employment_duration: profile.employment_duration || "",
                            contracting_duration: profile.contracting_duration || "",
                            business_name: profile.business_name || "",
                            business_duration: profile.business_duration || "",
                            income_range: profile.income_range || "",
                            variable_income_types: profile.variable_income_types || [],
                            intended_down_payment: profile.intended_down_payment || "",
                            funding_sources: profile.funding_sources || [],
                            funding_other_explanation: profile.funding_other_explanation || "",
                            gift_provider_relationship: profile.gift_provider_relationship || "",
                            gift_amount_range: profile.gift_amount_range || "",
                            gift_letter_available: profile.gift_letter_available || false,
                            liquid_savings_balance: profile.liquid_savings_balance || "",
                            has_investments: profile.has_investments || "",
                            investment_value_range: profile.investment_value_range || "",
                            has_cryptocurrency: profile.has_cryptocurrency || false,
                            crypto_storage_type: profile.crypto_storage_type || "",
                            crypto_exposure_level: profile.crypto_exposure_level || "",
                            funds_outside_canada: profile.funds_outside_canada || false,
                            funds_country_region: profile.funds_country_region || "",
                            credit_score_range: profile.credit_score_range || "",
                            monthly_debt_payments: profile.monthly_debt_payments || 0,
                            debt_credit_cards: profile.debt_credit_cards || 0,
                            debt_personal_loans: profile.debt_personal_loans || 0,
                            debt_auto_loans: profile.debt_auto_loans || 0,
                            debt_student_loans: profile.debt_student_loans || 0,
                            debt_other: profile.debt_other || 0,
                            missed_payments_last_12_months: profile.missed_payments_last_12_months || false,
                            missed_payment_type: profile.missed_payment_type || "",
                            missed_payment_count: profile.missed_payment_count || 0,
                            last_missed_payment_date: profile.last_missed_payment_date || "",
                            bankruptcy_proposal_history: profile.bankruptcy_proposal_history || false,
                            bankruptcy_type: profile.bankruptcy_type || "",
                            bankruptcy_filing_year: profile.bankruptcy_filing_year || "",
                            bankruptcy_discharge_date: profile.bankruptcy_discharge_date || "",
                            credit_additional_notes: profile.credit_additional_notes || "",
                            purchase_price_range: profile.purchase_price_range || "",
                            property_type: profile.property_type || "",
                            intended_use: profile.intended_use || "",
                            target_location: profile.target_location || "",
                            timeline_to_buy: profile.timeline_to_buy || "",
                        });
                    } else {
                        // Pre-fill with user account data if no profile exists
                        mortgageForm.reset({
                            full_name: userFullName,
                            email: userEmail,
                            age: 0,
                            phone_number: "",
                            date_of_birth: "",
                            first_time_buyer: false,
                            buying_with_co_borrower: false,
                            co_borrower_details: "",
                            employment_status: undefined,
                            employment_type: undefined,
                            employer_name: "",
                            client_names: [],
                            industry: "",
                            employment_duration: "",
                            contracting_duration: "",
                            business_name: "",
                            business_duration: "",
                            income_range: "",
                            variable_income_types: [],
                            intended_down_payment: "",
                            funding_sources: [],
                            funding_other_explanation: "",
                            gift_provider_relationship: "",
                            gift_amount_range: "",
                            gift_letter_available: false,
                            liquid_savings_balance: "",
                            has_investments: "",
                            investment_value_range: "",
                            has_cryptocurrency: false,
                            crypto_storage_type: "",
                            crypto_exposure_level: "",
                            funds_outside_canada: false,
                            funds_country_region: "",
                            credit_score_range: "",
                            monthly_debt_payments: 0,
                            debt_credit_cards: 0,
                            debt_personal_loans: 0,
                            debt_auto_loans: 0,
                            debt_student_loans: 0,
                            debt_other: 0,
                            missed_payments_last_12_months: false,
                            missed_payment_type: "",
                            missed_payment_count: 0,
                            last_missed_payment_date: "",
                            bankruptcy_proposal_history: false,
                            bankruptcy_type: "",
                            bankruptcy_filing_year: "",
                            bankruptcy_discharge_date: "",
                            credit_additional_notes: "",
                            purchase_price_range: "",
                            property_type: "",
                            intended_use: "",
                            target_location: "",
                            timeline_to_buy: "",
                        });
                    }
                } catch (error) {
                    console.error("Failed to load mortgage profile:", error);
                } finally {
                    setLoadingMortgageProfile(false);
                }
            };
            loadMortgageProfile();
        }
    }, [activeTab, currentUserId, userFullName, userEmail]);

    // Sync state with URL
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    // Load Sales Listings
    useEffect(() => {
        const loadListings = async () => {
            try {
                const data = await fetchAllSalesListings();
                setSalesListings(data);
            } catch (error) {
                console.error("Failed to load sales listings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load sales listings.",
                    variant: "destructive",
                });
            } finally {
                setLoadingListings(false);
            }
        };
        loadListings();
    }, []);

    // Load Co-ownership Signals
    useEffect(() => {
        const loadSignals = async () => {
            try {
                const data = await fetchCoOwnershipSignals();
                setSignals(data);
            } catch (error) {
                console.error("Failed to load co-ownership signals:", error);
            } finally {
                setLoadingSignals(false);
            }
        };
        loadSignals();
    }, []);

    const handleOpenCreateModal = () => {
        setEditingSignal(null);
        form.reset({
            capital_available: "",
            household_type: "Single",
            intended_use: "Live-in",
            time_horizon: "Flexible",
            notes: "",
            disclaimer: false,
        });
        setIsCreateSignalOpen(true);
    };

    const handleOpenEditModal = (signal: CoOwnershipSignal) => {
        setEditingSignal(signal);
        form.reset({
            capital_available: signal.capital_available,
            household_type: signal.household_type,
            intended_use: signal.intended_use,
            time_horizon: signal.time_horizon,
            notes: signal.notes || "",
            disclaimer: true, // Auto-check for edit, or force re-check? Usually auto-check is fine or just ignore. Schema requires true.
        });
        setIsCreateSignalOpen(true);
    };

    const handleSubmitSignal = async (values: z.infer<typeof createSignalSchema>) => {
        try {
            const { disclaimer, ...signalData } = values;

            if (editingSignal) {
                // Update
                const updatedSignal = await updateCoOwnershipSignal(editingSignal.id, signalData);
                setSignals((prev) => prev.map(s => s.id === updatedSignal.id ? updatedSignal : s));
                toast({
                    title: "Signal Updated",
                    description: "Your co-ownership signal has been updated successfully!",
                });
            } else {
                // Create
                const newSignal = await createCoOwnershipSignal(signalData as any);
                setSignals((prev) => [newSignal, ...prev]);
                toast({
                    title: "Signal Created",
                    description: "Your co-ownership signal is now visible to potential partners",
                });
            }
            setIsCreateSignalOpen(false);
            form.reset();
            setEditingSignal(null);
        } catch (error) {
            console.error("Failed to submit signal:", error);
            toast({
                title: "Error",
                description: "Failed to save co-ownership signal. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSubmitMortgageProfile = async (values: z.infer<typeof mortgageProfileSchema>) => {
        if (!currentUserId) return;

        try {
            const formData: MortgageProfileFormData = {
                full_name: values.full_name,
                email: values.email,
                age: values.age,
                phone_number: values.phone_number,
                date_of_birth: values.date_of_birth,
                first_time_buyer: values.first_time_buyer,
                buying_with_co_borrower: values.buying_with_co_borrower,
                co_borrower_details: values.co_borrower_details,
                employment_status: values.employment_status,
                employment_type: values.employment_type,
                employer_name: values.employer_name,
                client_names: values.client_names,
                industry: values.industry,
                employment_duration: values.employment_duration,
                contracting_duration: values.contracting_duration,
                business_name: values.business_name,
                business_duration: values.business_duration,
                income_range: values.income_range,
                variable_income_types: values.variable_income_types,
                intended_down_payment: values.intended_down_payment,
                funding_sources: values.funding_sources,
                funding_other_explanation: values.funding_other_explanation,
                gift_provider_relationship: values.gift_provider_relationship,
                gift_amount_range: values.gift_amount_range,
                gift_letter_available: values.gift_letter_available,
                liquid_savings_balance: values.liquid_savings_balance,
                has_investments: values.has_investments,
                investment_value_range: values.investment_value_range,
                has_cryptocurrency: values.has_cryptocurrency,
                crypto_storage_type: values.crypto_storage_type,
                crypto_exposure_level: values.crypto_exposure_level,
                funds_outside_canada: values.funds_outside_canada,
                funds_country_region: values.funds_country_region,
                credit_score_range: values.credit_score_range,
                monthly_debt_payments: values.monthly_debt_payments,
                debt_credit_cards: values.debt_credit_cards,
                debt_personal_loans: values.debt_personal_loans,
                debt_auto_loans: values.debt_auto_loans,
                debt_student_loans: values.debt_student_loans,
                debt_other: values.debt_other,
                missed_payments_last_12_months: values.missed_payments_last_12_months,
                missed_payment_type: values.missed_payment_type,
                missed_payment_count: values.missed_payment_count,
                last_missed_payment_date: values.last_missed_payment_date,
                bankruptcy_proposal_history: values.bankruptcy_proposal_history,
                bankruptcy_type: values.bankruptcy_type,
                bankruptcy_filing_year: values.bankruptcy_filing_year,
                bankruptcy_discharge_date: values.bankruptcy_discharge_date,
                credit_additional_notes: values.credit_additional_notes,
                purchase_price_range: values.purchase_price_range,
                property_type: values.property_type,
                intended_use: values.intended_use,
                target_location: values.target_location,
                timeline_to_buy: values.timeline_to_buy,
                broker_consent: mortgageProfile?.broker_consent || false,
            };
            
            // Track consent changes for notifications
            const consentChanged = mortgageProfile?.broker_consent !== (mortgageProfile?.broker_consent || false);
            const consentGiven = !mortgageProfile?.broker_consent && (mortgageProfile?.broker_consent || false);
            const consentRevoked = mortgageProfile?.broker_consent && !(mortgageProfile?.broker_consent || false);
            
            const savedProfile = await saveMortgageProfile(currentUserId, formData);
            setMortgageProfile(savedProfile);
            
            // Show appropriate toast based on consent status
            if (consentGiven) {
                toast({
                    title: "Profile Saved & Consent Recorded",
                    description: "Your profile will now be visible to our mortgage broker.",
                });
            } else if (consentRevoked) {
                toast({
                    title: "Profile Saved & Consent Revoked",
                    description: "Your profile is no longer visible to mortgage brokers.",
                });
            } else {
                toast({
                    title: "Profile Saved",
                    description: "Your mortgage profile has been saved successfully!",
                });
            }
        } catch (error) {
            console.error("Failed to save mortgage profile:", error);
            toast({
                title: "Error",
                description: "Failed to save mortgage profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    const coOwnershipListings = salesListings.filter(l => l.is_co_ownership);
    const salesOnlyListings = salesListings.filter(l => !l.is_co_ownership);

    return (
        <div className="w-full p-4 md:p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="text-4xl">
                            {activeTab === 'co-ownership' ? '🤝' : '🏠'}
                        </span>
                        {activeTab === 'co-ownership' ? 'Co-ownership Hub' : 'Buy Unit'}
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg font-medium">
                        Explore real estate opportunities tailored for co-ownership and direct sales.
                    </p>
                </div>
                {activeTab === 'co-ownership' && (
                    <Button onClick={handleOpenCreateModal} className="bg-roomie-purple hover:bg-roomie-purple/90 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg">
                        <PlusCircle className="h-5 w-5" /> Create Signal
                    </Button>
                )}
            </div>

            {activeTab === 'co-ownership' && (
                <div className="mb-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-roomie-purple mt-1">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm md:text-base">Have questions?</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600 font-medium">
                                <span>Click to learn:</span>
                                <span
                                    className="cursor-pointer text-roomie-purple hover:underline transition-colors font-black text-lg"
                                    onClick={() => navigate('/dashboard/co-ownership-guide')}
                                >
                                    How the program working?
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            onClick={() => setIsForecastModalOpen(true)}
                            className="bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm font-black whitespace-nowrap flex-1 md:flex-none"
                        >
                            <TrendingUp className="h-4 w-4 mr-2" /> Forecast Engine
                        </Button>
                        <Button
                            onClick={() => navigate('/dashboard/tenancy-legal-ai')}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-md font-bold whitespace-nowrap flex-1 md:flex-none"
                        >
                            <Scale className="h-4 w-4 mr-2" /> Ask our Legal AI
                        </Button>
                    </div>
                </div>
            )}

            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                <TabsContent value="co-ownership">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Handshake className="h-7 w-7 text-roomie-purple" /> Active Co-buyer Signals
                    </h2>
                    <p className="text-slate-600 mb-6">
                        These are signals from users looking for co-ownership partners. Create your own to find matches!
                    </p>
                    {loadingSignals ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {[1, 2, 3].map((i) => (
                                <Card key={`signal-skeleton-${i}`} className="overflow-hidden border-slate-200">
                                    <CardHeader className="p-4 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : signals.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 mb-12">
                            <Handshake className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Co-ownership Signals Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Be the first to create a co-ownership signal and find your ideal property partner!
                            </p>
                            <Button onClick={handleOpenCreateModal} className="mt-6 bg-roomie-purple hover:bg-roomie-purple/90 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg">
                                <PlusCircle className="h-5 w-5" /> Create Your Signal
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl">
                            {signals.map((signal) => (
                                <Card key={signal.id} className="group relative flex flex-col bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(110,89,255,0.15)] transition-all duration-300 border-none overflow-hidden hover:-translate-y-1 max-w-[480px]">
                                    <div className="p-6 md:p-8 flex flex-col h-full space-y-6">

                                        {/* 1) Header - Identity & Social Context */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="flex items-center gap-1.5 cursor-pointer group/author"
                                                    onClick={() => navigate(`/dashboard/user/${signal.user_id}`)}
                                                >
                                                    <span className="text-[11px] font-medium text-slate-400">Created by:</span>
                                                    <span className="text-[11px] font-bold text-slate-600 group-hover/author:text-roomie-purple transition-colors">
                                                        {signal.creator_name && signal.creator_name !== "Unknown User" ? signal.creator_name : "Anonymous Member"}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {(signal.creator_name === 'Mehdi' || signal.creator_name?.includes('Mehdi')) ? (
                                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter flex items-center gap-0.5">
                                                                <Star className="h-2 w-2 fill-amber-500" /> SUPER START
                                                            </span>
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">· Verified</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 rounded-full py-0">
                                                    #{signal.id.substring(0, 4)}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                {signal.household_type}
                                            </h3>
                                        </div>

                                        {/* 2) THE "I HAVE" SECTION - High Dominance */}
                                        <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[24px] p-6 relative overflow-hidden group/have">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/have:opacity-20 transition-opacity">
                                                <DollarSign className="h-12 w-12 text-emerald-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-2">MY CONTRIBUTION</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-black text-emerald-700 tracking-tighter">
                                                    💰 I HAVE {signal.capital_available}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-emerald-600/70 mt-1 uppercase tracking-wider">Available for immediate partnership</p>
                                        </div>

                                        {/* 3) THE "I WANT" SECTION - Narrative Box */}
                                        <div className="bg-purple-50/50 border-2 border-purple-100 rounded-[24px] p-6">
                                            <span className="text-[10px] font-black text-roomie-purple uppercase tracking-[0.2em] block mb-3 text-opacity-70">I’M LOOKING FOR</span>
                                            <p className="text-[17px] font-extrabold text-slate-800 leading-snug mb-4">
                                                {signal.intended_use === 'Live-in'
                                                    ? "I want to co-buy a home to live in together"
                                                    : signal.intended_use === 'Investment'
                                                        ? "Looking for a co-buyer for an investment property"
                                                        : `Looking to partner on a ${signal.intended_use} property`}
                                            </p>

                                            {/* Context Chips */}
                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-lg text-[11px] font-bold shadow-sm border border-slate-100">
                                                    {signal.intended_use === 'Live-in' ? <Home className="h-3.5 w-3.5 text-roomie-purple" /> : <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                                                    {signal.intended_use}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-lg text-[11px] font-bold shadow-sm border border-slate-100">
                                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                    {signal.time_horizon}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-lg text-[11px] font-bold shadow-sm border border-slate-100">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                    Any Location
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4) Narrative Context (Optional sentence) */}
                                        <div className="px-1">
                                            <p className="text-[13px] font-medium text-slate-400 leading-relaxed italic">
                                                {signal.notes ? (
                                                    signal.notes.length > 100 ? `${signal.notes.substring(0, 100)}...` : signal.notes
                                                ) : "Open to discussing structure, exit options, and premium locations."}
                                            </p>
                                        </div>

                                        {/* 5) Primary Action */}
                                        <div className="pt-4 mt-auto">
                                            {currentUserId === signal.user_id ? (
                                                <Button
                                                    onClick={() => handleOpenEditModal(signal)}
                                                    variant="outline"
                                                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-black text-sm h-14 rounded-2xl transition-all active:scale-95 shadow-sm uppercase tracking-widest"
                                                >
                                                    Edit My Signal
                                                </Button>
                                            ) : (
                                                <MessageButton
                                                    salesListingId={null}
                                                    landlordId={signal.user_id}
                                                    className="w-full bg-gradient-to-r from-roomie-purple to-indigo-600 hover:from-roomie-purple/90 hover:to-indigo-600/90 text-white font-black text-sm h-14 rounded-2xl shadow-[0_8px_16px_rgba(110,89,255,0.25)] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Propose Partnership
                                                </MessageButton>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Home className="h-7 w-7 text-roomie-purple" /> Co-ownership Properties
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Properties explicitly listed as available for co-ownership.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingListings ? (
                            [1, 2, 3].map((i) => (
                                <Card key={`listing-skeleton-${i}`} className="overflow-hidden border-slate-200">
                                    <Skeleton className="aspect-video w-full" />
                                    <CardHeader className="p-4 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : coOwnershipListings.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Home className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                                <p className="text-slate-400 font-medium">No co-ownership listings available yet.</p>
                                <p className="text-slate-500 max-w-md mx-auto mt-2">
                                    Check back later or create a signal to let others know what you're looking for!
                                </p>
                            </div>
                        ) : (
                            coOwnershipListings.map((listing) => (
                                <Card
                                    key={listing.id}
                                    className="overflow-hidden hover:shadow-xl transition-all border-slate-200 group cursor-pointer"
                                    onClick={() => window.open(`/dashboard/buy/${listing.id}?type=sale`, '_blank')}
                                >
                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.listing_title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mb-2" />
                                                <span className="text-xs">No image provided</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-roomie-purple text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg italic">Co-ownership</span>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <CardTitle className="text-xl font-black text-slate-900 line-clamp-1">{listing.listing_title}</CardTitle>
                                            <span className="text-roomie-purple font-black text-lg">
                                                ${listing.sales_price ? listing.sales_price.toLocaleString() : "0"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                            <MapPin className="h-4 w-4 text-roomie-purple" />
                                            <span className="line-clamp-1">{listing.city}, {listing.state}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-slate-600 text-sm mb-5 line-clamp-2 min-h-[40px]">
                                            Open to co-ownership. {listing.description || "Inquire for structure and share details."}
                                        </p>
                                        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.open(`/dashboard/buy/${listing.id}?type=sale&view=investor`, '_blank')}
                                                    className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Co-Buy Interest
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/dashboard/buy/${listing.id}?type=sale`, '_blank')}
                                                    className="flex-1 bg-slate-100 text-slate-900 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" /> View
                                                </button>
                                            </div>
                                            <MessageButton
                                                salesListingId={listing.id}
                                                landlordId={listing.user_id}
                                                className="w-full bg-roomie-purple text-white py-3.5 rounded-2xl font-black text-sm hover:bg-roomie-purple/90 transition-all active:scale-95 shadow-lg shadow-purple-100"
                                            >
                                                Join co-buy
                                            </MessageButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="sales">
                    {loadingListings ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={`sales-skeleton-${i}`} className="overflow-hidden border-slate-200">
                                    <Skeleton className="aspect-video w-full" />
                                    <CardHeader className="p-4 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : salesOnlyListings.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Home className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Sales Listings Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Check back soon for new property units for sale. Landlords and realtors are listing new opportunities daily.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {salesOnlyListings.map((listing) => (
                                <Card
                                    key={listing.id}
                                    className="overflow-hidden hover:shadow-xl transition-all border-slate-200 group cursor-pointer"
                                    onClick={() => window.open(`/dashboard/buy/${listing.id}?type=sale`, '_blank')}
                                >
                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.listing_title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <ImageIcon className="h-12 w-12 mb-2" />
                                                <span className="text-xs">No image provided</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">For Sale</span>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <CardTitle className="text-xl font-black text-slate-900 line-clamp-1">{listing.listing_title}</CardTitle>
                                            <span className="text-orange-600 font-black text-lg">
                                                ${listing.sales_price ? listing.sales_price.toLocaleString() : "0"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                            <MapPin className="h-4 w-4 text-orange-500" />
                                            <span className="line-clamp-1">{listing.city}, {listing.state}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-slate-600 text-sm mb-5 line-clamp-2 min-h-[40px]">
                                            {listing.description || "No description provided for this property."}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                                {listing.bedrooms || 0} Bed
                                            </span>
                                            <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                                {listing.bathrooms || 0} Bath
                                            </span>
                                            <span className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                                {listing.square_footage || 0} sqft
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => window.open(`/dashboard/buy/${listing.id}?type=sale`, '_blank')}
                                                className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" /> View Details
                                            </button>
                                            <MessageButton
                                                salesListingId={listing.id}
                                                landlordId={listing.user_id}
                                                className="w-full bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg"
                                            >
                                                Message Seller
                                            </MessageButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="mortgage-profile">
                    <div className="max-w-4xl">
                        {/* Header */}
                        <div className="space-y-2 mb-8">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Mortgage Profile</h1>
                            <p className="text-lg text-slate-600">Complete your basic information to start your mortgage pre-qualification journey</p>
                        </div>

                        {loadingMortgageProfile ? (
                            <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <User className="h-6 w-6 text-white" />
                                        <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                        ) : (
                            <Form {...mortgageForm}>
                                <form onSubmit={mortgageForm.handleSubmit(handleSubmitMortgageProfile)} className="space-y-6">
                                    {/* Basic Information Section */}
                                    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-6 w-6 text-white" />
                                                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                                            </div>
                                        </div>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Full Name - Editable */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="full_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Full Name</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <User className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                                    <Input
                                                                        className="pl-10 h-12 text-base"
                                                                        placeholder="John Doe"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <p className="text-sm text-slate-500">Pre-filled from your account</p>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Age - Editable */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="age"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Age</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Calendar className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                                    <Input
                                                                        type="number"
                                                                        className="pl-10 h-12 text-base"
                                                                        placeholder="25"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Email - Editable */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Email Address</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Mail className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                                    <Input
                                                                        type="email"
                                                                        className="pl-10 h-12 text-base"
                                                                        placeholder="john@example.com"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <p className="text-sm text-slate-500">Pre-filled from your account</p>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Phone Number - Editable */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="phone_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Phone Number</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Mail className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                                    <Input
                                                                        type="tel"
                                                                        className="pl-10 h-12 text-base"
                                                                        placeholder="+1 (555) 123-4567"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Date of Birth */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="date_of_birth"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Date of Birth</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Calendar className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                                    <Input
                                                                        type="date"
                                                                        className="pl-10 h-12 text-base"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* First-time Buyer */}
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="first_time_buyer"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col justify-end">
                                                            <FormLabel className="text-base font-semibold mb-3">First-time Buyer?</FormLabel>
                                                            <div className="flex items-center space-x-4 h-12">
                                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={field.value === true}
                                                                        onChange={() => field.onChange(true)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <span className="text-base">Yes</span>
                                                                </label>
                                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={field.value === false}
                                                                        onChange={() => field.onChange(false)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <span className="text-base">No</span>
                                                                </label>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Buying with Co-borrower */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="buying_with_co_borrower"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Buying alone or with co-borrower?</FormLabel>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === false}
                                                                    onChange={() => field.onChange(false)}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <span className="text-base">Alone</span>
                                                            </label>
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === true}
                                                                    onChange={() => field.onChange(true)}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <span className="text-base">With Co-borrower</span>
                                                            </label>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Co-borrower Details - Conditional */}
                                            {mortgageForm.watch('buying_with_co_borrower') && (
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="co_borrower_details"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Co-borrower Details</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Please provide details about your co-borrower (name, relationship, income, etc.)"
                                                                    className="min-h-[100px] text-base"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <p className="text-sm text-slate-500">Explain your co-borrower situation</p>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Employment & Income Snapshot Section */}
                                    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Briefcase className="h-6 w-6 text-white" />
                                                <h2 className="text-2xl font-bold text-white">Employment & Income Snapshot</h2>
                                            </div>
                                        </div>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Employment Status */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="employment_status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Employment Status <span className="text-red-500">*</span></FormLabel>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                                            {[
                                                                { value: 'employed', label: 'Employed' },
                                                                { value: 'contractor', label: 'Contractor' },
                                                                { value: 'self_employed', label: 'Self-Employed / Business Owner' },
                                                            ].map((option) => (
                                                                <label
                                                                    key={option.value}
                                                                    className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                                        field.value === option.value
                                                                            ? 'border-green-500 bg-green-50'
                                                                            : 'border-slate-200 hover:border-green-300'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        className="sr-only"
                                                                        checked={field.value === option.value}
                                                                        onChange={() => field.onChange(option.value)}
                                                                    />
                                                                    <span className="text-sm font-medium">{option.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional Fields Based on Employment Status */}
                                            {mortgageForm.watch('employment_status') === 'employed' && (
                                                <>
                                                    {/* Employment Type */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="employment_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Employment Type <span className="text-red-500">*</span></FormLabel>
                                                                <div className="flex gap-4 mt-2">
                                                                    {[
                                                                        { value: 'permanent', label: 'Permanent' },
                                                                        { value: 'part_time', label: 'Part-time' },
                                                                    ].map((option) => (
                                                                        <label
                                                                            key={option.value}
                                                                            className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                                                                field.value === option.value
                                                                                    ? 'border-green-500 bg-green-50'
                                                                                    : 'border-slate-200 hover:border-green-300'
                                                                            }`}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                className="sr-only"
                                                                                checked={field.value === option.value}
                                                                                onChange={() => field.onChange(option.value)}
                                                                            />
                                                                            <span className="text-sm font-medium">{option.label}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Employer Name */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="employer_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Employer Name <span className="text-slate-400 text-sm">(Optional)</span></FormLabel>
                                                                <FormControl>
                                                                    <Input className="h-12 text-base" placeholder="Company name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            )}

                                            {mortgageForm.watch('employment_status') === 'contractor' && (
                                                <>
                                                    {/* Client Names - Will implement as textarea for simplicity */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="employer_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Client Name(s) <span className="text-slate-400 text-sm">(Optional)</span></FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="min-h-[80px] text-base"
                                                                        placeholder="List your clients (up to 5) or select 'Multiple Clients'"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <p className="text-sm text-slate-500">Enter client names separated by commas</p>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            )}

                                            {mortgageForm.watch('employment_status') === 'self_employed' && (
                                                <>
                                                    {/* Business Name */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="business_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Business Name <span className="text-slate-400 text-sm">(Optional)</span></FormLabel>
                                                                <FormControl>
                                                                    <Input className="h-12 text-base" placeholder="Your business name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </>
                                            )}

                                            {/* Common Fields for All Employment Types */}
                                            {mortgageForm.watch('employment_status') && (
                                                <>
                                                    {/* Industry */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="industry"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Industry <span className="text-red-500">*</span></FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select your industry" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="technology">Technology</SelectItem>
                                                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                                                        <SelectItem value="finance">Finance</SelectItem>
                                                                        <SelectItem value="education">Education</SelectItem>
                                                                        <SelectItem value="construction">Construction</SelectItem>
                                                                        <SelectItem value="retail">Retail</SelectItem>
                                                                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                                                        <SelectItem value="services">Services</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Duration Field - Conditional based on employment type */}
                                                    {mortgageForm.watch('employment_status') === 'employed' && (
                                                        <FormField
                                                            control={mortgageForm.control}
                                                            name="employment_duration"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-base font-semibold">Time with Current Employer <span className="text-red-500">*</span></FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 text-base">
                                                                                <SelectValue placeholder="Select duration" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                                                                            <SelectItem value="1_2_years">1-2 years</SelectItem>
                                                                            <SelectItem value="2_5_years">2-5 years</SelectItem>
                                                                            <SelectItem value="5_10_years">5-10 years</SelectItem>
                                                                            <SelectItem value="over_10_years">Over 10 years</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    {mortgageForm.watch('employment_status') === 'contractor' && (
                                                        <FormField
                                                            control={mortgageForm.control}
                                                            name="contracting_duration"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-base font-semibold">Time Working as Contractor <span className="text-red-500">*</span></FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 text-base">
                                                                                <SelectValue placeholder="Select duration" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                                                                            <SelectItem value="1_2_years">1-2 years</SelectItem>
                                                                            <SelectItem value="2_5_years">2-5 years</SelectItem>
                                                                            <SelectItem value="5_10_years">5-10 years</SelectItem>
                                                                            <SelectItem value="over_10_years">Over 10 years</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    {mortgageForm.watch('employment_status') === 'self_employed' && (
                                                        <FormField
                                                            control={mortgageForm.control}
                                                            name="business_duration"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-base font-semibold">Time Operating Business <span className="text-red-500">*</span></FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 text-base">
                                                                                <SelectValue placeholder="Select duration" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                                                                            <SelectItem value="1_2_years">1-2 years</SelectItem>
                                                                            <SelectItem value="2_5_years">2-5 years</SelectItem>
                                                                            <SelectItem value="5_10_years">5-10 years</SelectItem>
                                                                            <SelectItem value="over_10_years">Over 10 years</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    {/* Income Range */}
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="income_range"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Annual Income Range <span className="text-red-500">*</span></FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select income range" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="under_30k">Under $30,000</SelectItem>
                                                                        <SelectItem value="30k_50k">$30,000 - $50,000</SelectItem>
                                                                        <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                                                                        <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                                                                        <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                                                                        <SelectItem value="150k_200k">$150,000 - $200,000</SelectItem>
                                                                        <SelectItem value="over_200k">Over $200,000</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Variable Income - Checkboxes */}
                                                    <div className="space-y-3">
                                                        <FormLabel className="text-base font-semibold">Variable Income <span className="text-slate-400 text-sm">(Optional)</span></FormLabel>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {mortgageForm.watch('employment_status') === 'employed' && (
                                                                <>
                                                                    {['Bonus', 'Commission'].map((type) => (
                                                                        <label key={type} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 text-green-600"
                                                                                checked={mortgageForm.watch('variable_income_types')?.includes(type.toLowerCase()) || false}
                                                                                onChange={(e) => {
                                                                                    const current = mortgageForm.getValues('variable_income_types') || [];
                                                                                    if (e.target.checked) {
                                                                                        mortgageForm.setValue('variable_income_types', [...current, type.toLowerCase()]);
                                                                                    } else {
                                                                                        mortgageForm.setValue('variable_income_types', current.filter(t => t !== type.toLowerCase()));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-sm font-medium">{type}</span>
                                                                        </label>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {mortgageForm.watch('employment_status') === 'contractor' && (
                                                                <>
                                                                    {['Project-based', 'Performance-based'].map((type) => (
                                                                        <label key={type} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 text-green-600"
                                                                                checked={mortgageForm.watch('variable_income_types')?.includes(type.toLowerCase().replace('-', '_')) || false}
                                                                                onChange={(e) => {
                                                                                    const current = mortgageForm.getValues('variable_income_types') || [];
                                                                                    const value = type.toLowerCase().replace('-', '_');
                                                                                    if (e.target.checked) {
                                                                                        mortgageForm.setValue('variable_income_types', [...current, value]);
                                                                                    } else {
                                                                                        mortgageForm.setValue('variable_income_types', current.filter(t => t !== value));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-sm font-medium">{type}</span>
                                                                        </label>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {mortgageForm.watch('employment_status') === 'self_employed' && (
                                                                <>
                                                                    {['Dividends', 'Profit distributions', 'Irregular income'].map((type) => (
                                                                        <label key={type} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 text-green-600"
                                                                                checked={mortgageForm.watch('variable_income_types')?.includes(type.toLowerCase().replace(' ', '_')) || false}
                                                                                onChange={(e) => {
                                                                                    const current = mortgageForm.getValues('variable_income_types') || [];
                                                                                    const value = type.toLowerCase().replace(' ', '_');
                                                                                    if (e.target.checked) {
                                                                                        mortgageForm.setValue('variable_income_types', [...current, value]);
                                                                                    } else {
                                                                                        mortgageForm.setValue('variable_income_types', current.filter(t => t !== value));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-sm font-medium">{type}</span>
                                                                        </label>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Assets & Down Payment Snapshot Section */}
                                    <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
                                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white pb-4">
                                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                <DollarSign className="h-6 w-6" />
                                                Assets & Down Payment Snapshot
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Tile 1: Intended Down Payment */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="intended_down_payment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Expected Down Payment</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select down payment range" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="less_than_5">{"< 5% of purchase price"}</SelectItem>
                                                                <SelectItem value="5_to_9.99">5% – 9.99%</SelectItem>
                                                                <SelectItem value="10_to_19.99">10% – 19.99%</SelectItem>
                                                                <SelectItem value="20_to_34.99">20% – 34.99%</SelectItem>
                                                                <SelectItem value="35_or_more">35% or more</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Tile 2: Primary Source(s) of Funds */}
                                            <div className="space-y-3">
                                                <FormLabel className="text-base font-semibold">Primary Source(s) of Funds <span className="text-slate-400 text-sm">(Select all that apply)</span></FormLabel>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {['Personal savings', 'Gifted funds', 'Sale of property', 'Investments', 'Other'].map((source) => (
                                                        <label key={source} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-white cursor-pointer">
                                                            <Checkbox
                                                                checked={mortgageForm.watch('funding_sources')?.includes(source.toLowerCase().replace(/ /g, '_')) || false}
                                                                onCheckedChange={(checked) => {
                                                                    const current = mortgageForm.getValues('funding_sources') || [];
                                                                    const value = source.toLowerCase().replace(/ /g, '_');
                                                                    if (checked) {
                                                                        mortgageForm.setValue('funding_sources', [...current, value]);
                                                                    } else {
                                                                        mortgageForm.setValue('funding_sources', current.filter(s => s !== value));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium">{source}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Conditional: Other explanation */}
                                            {mortgageForm.watch('funding_sources')?.includes('other') && (
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="funding_other_explanation"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Please explain other funding source</FormLabel>
                                                            <FormControl>
                                                                <Textarea className="min-h-[80px] text-base" placeholder="Describe your other funding source..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Conditional Tile 2a: Gift Details */}
                                            {mortgageForm.watch('funding_sources')?.includes('gifted_funds') && (
                                                <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-amber-200">
                                                    <h4 className="font-semibold text-amber-800">Gift Details</h4>
                                                    
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="gift_provider_relationship"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Relationship to gift provider</FormLabel>
                                                                <FormControl>
                                                                    <Input className="h-12 text-base" placeholder="e.g., Parent, Sibling" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="gift_amount_range"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Expected gift amount (range)</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select amount range" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="under_10k">Under $10,000</SelectItem>
                                                                        <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                                                                        <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                                                                        <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                                                                        <SelectItem value="over_100k">Over $100,000</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="gift_letter_available"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center gap-3">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-base font-medium !mt-0">Signed gift letter will be available</FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {/* Tile 3: Estimated Liquid Savings */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="liquid_savings_balance"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Total Liquid Savings Balance</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select savings range" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="under_10k">{"< $10,000"}</SelectItem>
                                                                <SelectItem value="10k_24.999">$10,000 – $24,999</SelectItem>
                                                                <SelectItem value="25k_49.999">$25,000 – $49,999</SelectItem>
                                                                <SelectItem value="50k_99.999">$50,000 – $99,999</SelectItem>
                                                                <SelectItem value="100k_plus">$100,000+</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Tile 4: Investment Assets Overview */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="has_investments"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Do you hold investments that may contribute to the purchase?</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select investment status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="yes_liquid">Yes – liquid investments</SelectItem>
                                                                <SelectItem value="yes_long_term">Yes – long-term investments</SelectItem>
                                                                <SelectItem value="no">No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional Tile 4a: Investment value range */}
                                            {(mortgageForm.watch('has_investments') === 'yes_liquid' || mortgageForm.watch('has_investments') === 'yes_long_term') && (
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="investment_value_range"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Estimated total investment value (range)</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 text-base">
                                                                        <SelectValue placeholder="Select value range" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="under_25k">Under $25,000</SelectItem>
                                                                    <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                                                                    <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                                                                    <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                                                                    <SelectItem value="over_250k">Over $250,000</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Tile 5: Cryptocurrency Exposure */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="has_cryptocurrency"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-3">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-base font-medium !mt-0">I hold cryptocurrency assets</FormLabel>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional Tile 5a: Crypto details */}
                                            {mortgageForm.watch('has_cryptocurrency') && (
                                                <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-amber-200">
                                                    <h4 className="font-semibold text-amber-800">Cryptocurrency Details</h4>
                                                    
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="crypto_storage_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Held on</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select storage type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="regulated_exchange">Regulated exchange</SelectItem>
                                                                        <SelectItem value="cold_wallet">Cold wallet</SelectItem>
                                                                        <SelectItem value="mixed">Mixed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="crypto_exposure_level"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Approximate exposure</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select exposure level" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="minimal">Minimal ({"<5%"})</SelectItem>
                                                                        <SelectItem value="moderate">Moderate (5–20%)</SelectItem>
                                                                        <SelectItem value="significant">Significant ({">20%"})</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {/* Tile 6: Funds Location & Jurisdiction */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="funds_outside_canada"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-3">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-base font-medium !mt-0">Down payment funds are held outside Canada</FormLabel>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional Tile 6a: Country/region */}
                                            {mortgageForm.watch('funds_outside_canada') && (
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="funds_country_region"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">Country / Region</FormLabel>
                                                            <FormControl>
                                                                <Input className="h-12 text-base" placeholder="e.g., United States, United Kingdom" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Credit & Debts (Self-Declared) Section */}
                                    <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-pink-50">
                                        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white pb-4">
                                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                <AlertTriangle className="h-6 w-6" />
                                                Credit & Debts (Self-Declared)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Credit Score Range */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="credit_score_range"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Credit Score Range <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select credit score range" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="excellent">Excellent (750+)</SelectItem>
                                                                <SelectItem value="good">Good (700-749)</SelectItem>
                                                                <SelectItem value="fair">Fair (650-699)</SelectItem>
                                                                <SelectItem value="poor">Poor (Below 650)</SelectItem>
                                                                <SelectItem value="unsure">Unsure</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Monthly Debt Payments - Detailed Breakdown */}
                                            <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-red-100">
                                                <h4 className="font-semibold text-red-800">Monthly Debt Payments Breakdown</h4>
                                                <p className="text-sm text-slate-600">Enter your approximate monthly payments for each debt type (optional)</p>
                                                
                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="debt_credit_cards"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base">Credit Cards</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-12 text-base" 
                                                                    placeholder="e.g., 200" 
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="debt_personal_loans"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base">Personal Loans</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-12 text-base" 
                                                                    placeholder="e.g., 300" 
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="debt_auto_loans"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base">Auto Loans</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-12 text-base" 
                                                                    placeholder="e.g., 400" 
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="debt_student_loans"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base">Student Loans</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-12 text-base" 
                                                                    placeholder="e.g., 250" 
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={mortgageForm.control}
                                                    name="debt_other"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base">Other Debts</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-12 text-base" 
                                                                    placeholder="e.g., 100" 
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Total Calculation Display */}
                                                <div className="pt-4 border-t-2 border-red-200">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-base font-semibold text-red-800">Total Monthly Debt Payments:</span>
                                                        <span className="text-xl font-bold text-red-600">
                                                            ${(
                                                                (mortgageForm.watch('debt_credit_cards') || 0) +
                                                                (mortgageForm.watch('debt_personal_loans') || 0) +
                                                                (mortgageForm.watch('debt_auto_loans') || 0) +
                                                                (mortgageForm.watch('debt_student_loans') || 0) +
                                                                (mortgageForm.watch('debt_other') || 0)
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Missed Payments in Last 12 Months */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="missed_payments_last_12_months"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Missed Payments in Last 12 Months? <span className="text-red-500">*</span></FormLabel>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === true}
                                                                    onChange={() => field.onChange(true)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-base">Yes</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === false}
                                                                    onChange={() => field.onChange(false)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-base">No</span>
                                                            </label>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional: Missed Payment Details */}
                                            {mortgageForm.watch('missed_payments_last_12_months') && (
                                                <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-amber-200">
                                                    <h4 className="font-semibold text-amber-800">Missed Payment Details</h4>
                                                    
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="missed_payment_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Type of missed payment</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="credit_card">Credit card</SelectItem>
                                                                        <SelectItem value="loan">Loan</SelectItem>
                                                                        <SelectItem value="utility">Utility</SelectItem>
                                                                        <SelectItem value="other">Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="missed_payment_count"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Number of missed payments</FormLabel>
                                                                <FormControl>
                                                                    <Input 
                                                                        type="number" 
                                                                        className="h-12 text-base" 
                                                                        placeholder="e.g., 2" 
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="last_missed_payment_date"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Last missed payment date (month/year)</FormLabel>
                                                                <FormControl>
                                                                    <Input 
                                                                        className="h-12 text-base" 
                                                                        placeholder="e.g., January 2024" 
                                                                        {...field} 
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {/* Bankruptcy / Proposal History */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="bankruptcy_proposal_history"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Bankruptcy / Proposal History? <span className="text-red-500">*</span></FormLabel>
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === true}
                                                                    onChange={() => field.onChange(true)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-base">Yes</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    checked={field.value === false}
                                                                    onChange={() => field.onChange(false)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-base">No</span>
                                                            </label>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Conditional: Bankruptcy Details */}
                                            {mortgageForm.watch('bankruptcy_proposal_history') && (
                                                <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-amber-200">
                                                    <h4 className="font-semibold text-amber-800">Bankruptcy / Proposal Details</h4>
                                                    
                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="bankruptcy_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Type</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base">
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                                                                        <SelectItem value="consumer_proposal">Consumer Proposal</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="bankruptcy_filing_year"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Year of filing</FormLabel>
                                                                <FormControl>
                                                                    <Input 
                                                                        className="h-12 text-base" 
                                                                        placeholder="e.g., 2020" 
                                                                        {...field} 
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={mortgageForm.control}
                                                        name="bankruptcy_discharge_date"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">Discharge date (month/year)</FormLabel>
                                                                <FormControl>
                                                                    <Input 
                                                                        className="h-12 text-base" 
                                                                        placeholder="e.g., June 2023" 
                                                                        {...field} 
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {/* Additional Notes */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="credit_additional_notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Additional Notes <span className="text-slate-400 text-sm">(Optional)</span></FormLabel>
                                                        <FormControl>
                                                            <Textarea 
                                                                className="min-h-[100px] text-base" 
                                                                placeholder="Any additional information about your credit or debts..." 
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Property Intent Section */}
                                    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
                                        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white pb-4">
                                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                                <Building2 className="h-6 w-6" />
                                                Property Intent
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Purchase Price Range */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="purchase_price_range"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Purchase Price Range <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select price range" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="under_300k">Under $300,000</SelectItem>
                                                                <SelectItem value="300k_500k">$300,000 - $500,000</SelectItem>
                                                                <SelectItem value="500k_750k">$500,000 - $750,000</SelectItem>
                                                                <SelectItem value="750k_1m">$750,000 - $1,000,000</SelectItem>
                                                                <SelectItem value="1m_1.5m">$1,000,000 - $1,500,000</SelectItem>
                                                                <SelectItem value="over_1.5m">Over $1,500,000</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Property Type */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="property_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Property Type <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select property type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="condo">Condo</SelectItem>
                                                                <SelectItem value="house">House</SelectItem>
                                                                <SelectItem value="multi_unit">Multi-unit</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Intended Use */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="intended_use"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Intended Use <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select intended use" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="primary_residence">Primary residence</SelectItem>
                                                                <SelectItem value="rental">Rental</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Target Location */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="target_location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">City / Province / State <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                className="h-12 text-base" 
                                                                placeholder="e.g., Toronto, Ontario" 
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Timeline to Buy */}
                                            <FormField
                                                control={mortgageForm.control}
                                                name="timeline_to_buy"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold">Timeline to Buy <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 text-base">
                                                                    <SelectValue placeholder="Select timeline" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="0_3_months">0–3 months</SelectItem>
                                                                <SelectItem value="3_6_months">3–6 months</SelectItem>
                                                                <SelectItem value="6_12_months">6–12 months</SelectItem>
                                                                <SelectItem value="over_12_months">Over 12 months</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Broker Consent Section */}
                                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-pink-50 to-purple-50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <Checkbox
                                                    id="broker_consent"
                                                    checked={mortgageProfile?.broker_consent || false}
                                                    onCheckedChange={(checked) => {
                                                        // Update the profile state
                                                        if (mortgageProfile) {
                                                            setMortgageProfile({
                                                                ...mortgageProfile,
                                                                broker_consent: checked as boolean
                                                            });
                                                        }
                                                    }}
                                                    className="mt-1 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                                />
                                                <div className="flex-1">
                                                    <label 
                                                        htmlFor="broker_consent" 
                                                        className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2 mb-2"
                                                    >
                                                        <Shield className="h-5 w-5 text-purple-600" />
                                                        <span>Share with Mortgage Broker</span>
                                                    </label>
                                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                        I consent to share my mortgage profile with Roomie AI's trusted mortgage broker 
                                                        for the purpose of mortgage review and recommendations. You can revoke this 
                                                        consent at any time.
                                                    </p>
                                                    {mortgageProfile?.broker_consent && (
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2 rounded-lg border border-green-200">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Your profile is visible to our mortgage broker</span>
                                                            {mortgageProfile?.broker_consent_date && (
                                                                <span className="text-gray-600">
                                                                    • Consented on {new Date(mortgageProfile.broker_consent_date).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {!mortgageProfile?.broker_consent && (
                                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 font-medium bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                            <Info className="h-4 w-4" />
                                                            <span>Your profile is private and not shared with brokers</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Sticky Save Button */}
                                    <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 p-4 shadow-lg z-10 flex justify-end">
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold shadow-md"
                                            disabled={mortgageForm.formState.isSubmitting}
                                        >
                                            {mortgageForm.formState.isSubmitting ? "Saving..." : "Save Profile"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isCreateSignalOpen} onOpenChange={setIsCreateSignalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    <div className="bg-roomie-purple p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Handshake className="h-24 w-24" />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-2">
                                Post Your Co-ownership Signal
                            </DialogTitle>
                            <DialogDescription className="text-purple-100 text-lg font-medium leading-tight">
                                Let others quickly understand what you bring and what you’re looking for.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitSignal)} className="p-6 md:p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto">
                            {/* Section 1: What I Have */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
                                    <div className="bg-emerald-100 p-2 rounded-lg">
                                        <Briefcase className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h3 className="font-black text-xl tracking-tight">What I Have</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <FormField
                                        control={form.control}
                                        name="capital_available"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold">Capital Available</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="$30,000 – $50,000"
                                                        className="bg-white border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple h-12 rounded-xl font-medium"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Cash available for down payment</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="household_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold">Household Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple h-12 rounded-xl font-medium">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-200">
                                                        <SelectItem value="Single">Single</SelectItem>
                                                        <SelectItem value="Couple">Couple</SelectItem>
                                                        <SelectItem value="Family">Family</SelectItem>
                                                        <SelectItem value="Investor group">Investor group</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Helps match with compatible co-owners</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Section 2: What I'm Looking For */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <SearchIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-black text-xl tracking-tight">What I'm Looking For</h3>
                                </div>

                                <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="intended_use"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-bold">Intended Use</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple h-12 rounded-xl font-medium">
                                                                <SelectValue placeholder="Select use" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-slate-200">
                                                            <SelectItem value="Live-in">Live-in</SelectItem>
                                                            <SelectItem value="Investment">Investment</SelectItem>
                                                            <SelectItem value="Mixed">Mixed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="time_horizon"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-bold">Time Horizon</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple h-12 rounded-xl font-medium">
                                                                <SelectValue placeholder="Select years" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-slate-200">
                                                            <SelectItem value="1–2 years">1–2 years</SelectItem>
                                                            <SelectItem value="3–5 years">3–5 years</SelectItem>
                                                            <SelectItem value="Flexible">Flexible</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold">Preferences & Notes (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Location preference, lifestyle, exit expectations, concerns..."
                                                        className="bg-white border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple rounded-xl font-medium min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Trust & Legal Clarity */}
                            <FormField
                                control={form.control}
                                name="disclaimer"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border-2 border-indigo-100 p-5 bg-indigo-50/30">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="w-6 h-6 border-slate-300 data-[state=checked]:bg-roomie-purple data-[state=checked]:border-roomie-purple rounded-md"
                                            />
                                        </FormControl>
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                                            <FormLabel className="text-sm font-bold text-slate-700 leading-tight cursor-pointer">
                                                I understand this signal is non-binding and used only to form potential co-ownership groups. No legal or financial commitment is created.
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-0 flex items-center justify-between border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-slate-500 font-bold hover:bg-slate-50 px-6 h-12 rounded-xl"
                                    onClick={() => setIsCreateSignalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-roomie-purple hover:bg-roomie-purple/90 text-white font-black px-8 h-12 rounded-xl shadow-xl shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
                                    disabled={form.formState.isSubmitting || !form.watch('disclaimer')}
                                >
                                    {form.formState.isSubmitting
                                        ? (editingSignal ? "Updating..." : "Publishing...")
                                        : (editingSignal ? "Update My Signal" : "Publish My Co-ownership Signal")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <CoOwnershipForecastModal
                isOpen={isForecastModalOpen}
                onClose={() => setIsForecastModalOpen(false)}
            />
        </div >
    );
}
