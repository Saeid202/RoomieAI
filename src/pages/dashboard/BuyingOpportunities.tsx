import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Loader2, Home, DollarSign, Users, Clock, AlertCircle, CheckCircle, XCircle, ArrowRight, MessageSquare, Edit2, Plus, Info, Scale, Pencil, PlusCircle, Handshake, HelpCircle, Image as ImageIcon, Eye } from "lucide-react";
import { fetchAllSalesListings, SalesListing, CoOwnershipSignal, fetchCoOwnershipSignals, createCoOwnershipSignal, updateCoOwnershipSignal } from "@/services/propertyService";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageButton } from "@/components/MessageButton";
import { Button } from "@/components/ui/button";
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
    household_type: z.enum(["Single", "Couple", "Family"]),
    intended_use: z.enum(["Live-in", "Investment", "Mixed"]),
    time_horizon: z.enum(["1–2 years", "3–5 years", "Flexible"]),
    notes: z.string().optional(),
    disclaimer: z.boolean().refine(val => val === true, "You must agree to the disclaimer"),
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
                    description: "Your co-ownership signal has been posted successfully!",
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
                    <Button
                        onClick={() => navigate('/dashboard/tenancy-legal-ai')}
                        className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-md font-bold whitespace-nowrap"
                    >
                        <Scale className="h-4 w-4 mr-2" /> Ask our Legal AI
                    </Button>
                </div>
            )}

            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                {activeTab !== 'co-ownership' && (
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="co-ownership">Co-ownership</TabsTrigger>
                        <TabsTrigger value="sales">Buy Unit</TabsTrigger>
                    </TabsList>
                )}

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {signals.map((signal) => (
                                <Card key={signal.id} className="overflow-hidden hover:shadow-xl transition-all border-slate-200 group relative">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1 mr-2">
                                                <CardTitle className="text-xl font-black text-slate-900 line-clamp-1 flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-roomie-purple" />
                                                    {signal.household_type} household
                                                </CardTitle>
                                                <div
                                                    className="flex items-center gap-2 mt-2 group cursor-pointer"
                                                    onClick={() => navigate(`/dashboard/user/${signal.user_id}`)}
                                                >
                                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted by:</span>
                                                    <span className="text-sm font-bold text-roomie-purple group-hover:underline truncate max-w-[200px]">
                                                        {signal.creator_name && signal.creator_name !== "Unknown User" ? signal.creator_name : "Anonymous Member"}
                                                    </span>
                                                </div>
                                            </div>

                                            {currentUserId === signal.user_id && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-9 px-3 gap-2 bg-slate-100 hover:bg-roomie-purple hover:text-white text-slate-600 font-bold transition-all shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditModal(signal);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" /> Edit
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 text-slate-500 text-sm font-medium mt-2">
                                            <span className="flex items-center gap-2">
                                                <Home className="h-4 w-4 text-emerald-500" />
                                                {signal.intended_use} Use
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                                {signal.capital_available} available
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-emerald-500" />
                                                {signal.time_horizon}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3 min-h-[60px] italic">
                                            "{signal.notes || "No additional notes provided."}"
                                        </p>
                                        <MessageButton
                                            salesListingId={null}
                                            landlordId={signal.user_id}
                                            className="w-full bg-roomie-purple text-white py-3.5 rounded-2xl font-black text-sm hover:bg-roomie-purple/90 transition-all active:scale-95 shadow-lg shadow-purple-100"
                                        >
                                            Message Co-buyer
                                        </MessageButton>
                                    </CardContent>
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
                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale`, '_blank')}
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
                                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale&view=investor`, '_blank')}
                                                    className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Co-Buy Interest
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale`, '_blank')}
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
                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale`, '_blank')}
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
                                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">For Sale</span>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <CardTitle className="text-xl font-black text-slate-900 line-clamp-1">{listing.listing_title}</CardTitle>
                                            <span className="text-emerald-600 font-black text-lg">
                                                ${listing.sales_price ? listing.sales_price.toLocaleString() : "0"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                            <MapPin className="h-4 w-4 text-emerald-500" />
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
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale&view=investor`, '_blank')}
                                                    className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Co-Buy Interest
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/dashboard/rental-options/${listing.id}?type=sale`, '_blank')}
                                                    className="flex-1 bg-slate-100 text-slate-900 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" /> View
                                                </button>
                                            </div>
                                            <MessageButton
                                                salesListingId={listing.id}
                                                landlordId={listing.user_id}
                                                className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg"
                                            >
                                                Message
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingSignal ? "Edit Co-ownership Signal" : "Create Co-ownership Signal"}</DialogTitle>
                        <DialogDescription>
                            {editingSignal ? "Update the details of your signal." : "Let others know you're looking for a co-ownership opportunity."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitSignal)} className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="capital_available"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>💰 Capital Available</FormLabel>
                                        <FormControl>
                                            <Input placeholder="$30,000 – $50,000 or exact amount" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="household_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>👤 Household Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Couple">Couple</SelectItem>
                                                    <SelectItem value="Family">Family</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="intended_use"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>🏠 Intended Use</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                                            <FormLabel>⏳ Time Horizon</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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
                                        <FormLabel>📝 Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Goals, location preference, concerns..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="disclaimer"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I understand this is non-binding and for group formation only
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" className="bg-roomie-purple hover:bg-roomie-purple/90" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? (editingSignal ? "Updating..." : "Creating...") : (editingSignal ? "Update Signal" : "Create Signal")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div >
    );
}
