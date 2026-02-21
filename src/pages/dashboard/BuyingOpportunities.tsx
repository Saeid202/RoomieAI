import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Loader2, Home, DollarSign, Users, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, MessageSquare, Edit2, Plus, Info, Scale, Pencil, PlusCircle, Handshake, HelpCircle, Image as ImageIcon, Eye, TrendingUp, Briefcase, Shield, Search as SearchIcon, Star } from "lucide-react";
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

const createSignalSchema = z.object({
    capital_available: z.string().min(1, "Capital available is required"),
    household_type: z.enum(["Single", "Couple", "Family", "Investor group"]),
    intended_use: z.enum(["Live-in", "Investment", "Mixed"]),
    time_horizon: z.enum(["1–2 years", "3–5 years", "Flexible"]),
    notes: z.string().optional(),
    disclaimer: z.boolean().refine(val => val === true, "You must agree to the non-binding confirmation"),
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

    // Fetch user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        getUser();
    }, []);

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
