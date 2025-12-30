import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Key, MapPin, Search, Tags, Image as ImageIcon, Eye } from "lucide-react";
import { fetchAllSalesListings, SalesListing } from "@/services/propertyService";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageButton } from "@/components/MessageButton";

export default function BuyingOpportunitiesPage() {
    const [activeTab, setActiveTab] = useState("co-ownership");
    const [salesListings, setSalesListings] = useState<SalesListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAllSalesListings();
                setSalesListings(data);
            } catch (error) {
                console.error("Failed to load sales listings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="w-full p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="text-4xl">🏘️</span>
                    Buying Opportunities
                </h1>
                <p className="text-slate-600 text-base md:text-lg font-medium">
                    Explore real estate opportunities tailored for co-ownership and direct sales.
                </p>
            </div>

            <Tabs defaultValue="co-ownership" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
                    <TabsTrigger value="co-ownership" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        co-ownership opportunities
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        units for sales
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="co-ownership">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map((i) => (
                                <Card key={i} className="overflow-hidden border-slate-200">
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
                        ) : salesListings.filter(l => l.is_co_ownership).length === 0 ? (
                            <>
                                {/* Fallback to static examples or empty state */}
                                <Card className="overflow-hidden hover:shadow-lg transition-all border-slate-200 opacity-80">
                                    <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                                        <Building2 className="h-12 w-12 text-slate-300" />
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-roomie-purple text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Example</span>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <CardTitle className="text-xl font-bold">Downtown Loft Project</CardTitle>
                                            <span className="text-roomie-purple font-black text-lg">$245k / share</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-slate-600 text-sm mb-4">No real co-ownership listings available yet. Join a waitlist or check back soon.</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-dashed border-2 border-slate-200 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                        <Search className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Build Your Own Group</h3>
                                    <button className="text-roomie-purple font-black text-sm hover:underline">
                                        Create Group Proposal
                                    </button>
                                </Card>
                            </>
                        ) : (
                            salesListings.filter(l => l.is_co_ownership).map((listing) => (
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
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="overflow-hidden border-slate-200">
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
                    ) : salesListings.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Home className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Sales Listings Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Check back soon for new property units for sale. Landlords and realtors are listing new opportunities daily.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {salesListings.map((listing) => (
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
        </div>
    );
}
