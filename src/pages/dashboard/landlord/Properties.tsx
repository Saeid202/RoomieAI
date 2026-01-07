import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon, AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPropertiesByOwnerId, Property, deleteProperty, getSalesListingsByOwnerId, SalesListing, deleteSalesListing, claimProperties } from "@/services/propertyService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";


export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [salesListings, setSalesListings] = useState<SalesListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFixDialog, setShowFixDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [orphanedProps, setOrphanedProps] = useState<any[]>([]);

  const FIX_RLS_SCRIPT = `
-- FIX PROPERTIES RLS POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to view properties (Public Listing)
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON public.properties;
CREATE POLICY "Public properties are viewable by everyone" 
ON public.properties FOR SELECT USING (true);

-- 2. Allow landlords to create properties
DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
CREATE POLICY "Users can insert their own properties" 
ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Allow landlords to update their own properties
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties" 
ON public.properties FOR UPDATE USING (auth.uid() = user_id);

-- 4. Allow landlords to delete their own properties
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties" 
ON public.properties FOR DELETE USING (auth.uid() = user_id);
`;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        setOrphanedProps([]); // Reset
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProperties([]);
          return;
        }
        setCurrentUserId(user.id);
        const list = await getPropertiesByOwnerId(user.id);
        const sList = await getSalesListingsByOwnerId(user.id);
        console.log("🔍 Properties loaded:", list);
        console.log("🔍 Sales listings loaded:", sList);
        if (mounted) {
          setProperties(list);
          setSalesListings(sList);
        }



      } catch (e: any) {
        console.error("Failed to load landlord properties", e);
        if (mounted) {
          setError(e.message || "Failed to load properties");
          setShowFixDialog(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  // Separate effect for diagnostic check to avoid cluttering the main load
  useEffect(() => {
    if (!currentUserId || loading) return;

    const checkOrphans = async () => {
      // Logic: If we feel missing data (empty lists), checks for orphaned items.
      // We check if EITHER list is empty to be safe.
      if (properties.length === 0 || salesListings.length === 0) {
        console.log("🔍 Checking for orphaned items...");

        const orphans: any[] = [];

        // Check Rentals
        if (properties.length === 0) {
          const { data: allProps } = await supabase
            .from('properties' as any)
            .select('id, listing_title, user_id')
            .limit(10);

          if (allProps) {
            const others = (allProps as any[]).filter(p => p.user_id !== currentUserId || !p.user_id);
            orphans.push(...others.map(p => ({ ...p, type: 'rental' })));
          }
        }

        // Check Sales
        if (salesListings.length === 0) {
          const { data: allSales } = await supabase
            .from('sales_listings' as any)
            .select('id, listing_title, user_id')
            .limit(10);

          if (allSales) {
            const others = (allSales as any[]).filter(p => p.user_id !== currentUserId || !p.user_id);
            orphans.push(...others.map(p => ({ ...p, type: 'sale' })));
          }
        }

        if (orphans.length > 0) {
          console.warn("🔍 Potential orphaned items found:", orphans);
          setOrphanedProps(orphans);
        }
      }
    };

    checkOrphans();
  }, [currentUserId, loading, properties.length, salesListings.length]);

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm("Delete this listing? This cannot be undone.");
      if (!confirmed) return;
      await deleteProperty(id);
      setProperties((prev) => prev.filter(p => p.id !== id));
      toast.success("Listing deleted");
    } catch (e: any) {
      console.error("Delete failed", e);
      toast.error(e?.message || "Failed to delete listing");
    }
  };

  const handleDeleteSales = async (id: string) => {
    try {
      const confirmed = window.confirm("Delete this sales listing? This cannot be undone.");
      if (!confirmed) return;
      await deleteSalesListing(id);
      setSalesListings((prev) => prev.filter(p => p.id !== id));
      toast.success("Sales listing deleted");
    } catch (e: any) {
      console.error("Delete failed", e);
      toast.error(e?.message || "Failed to delete listing");
    }
  };

  const handleClaimProperties = async () => {
    if (!currentUserId || orphanedProps.length === 0) return;

    // Get ALL unique owner IDs found inorphaned props
    const oldIds = Array.from(new Set(orphanedProps.map(p => p.user_id).filter(id => !!id)));

    try {
      setLoading(true);
      let totalClaimed = 0;

      for (const oldId of oldIds) {
        console.log(`Attempting to claim properties from ${oldId}...`);
        const success = await claimProperties(currentUserId, oldId);
        if (success) totalClaimed++;
      }

      if (totalClaimed > 0) {
        toast.success(`Successfully claimed properties from ${totalClaimed} old source(s)!`);
        // Reload properties
        const list = await getPropertiesByOwnerId(currentUserId);
        const sList = await getSalesListingsByOwnerId(currentUserId);
        setProperties(list);
        setSalesListings(sList);
        setOrphanedProps([]);
      } else {
        toast.error("Claim failed. Please run the 'Database Setup' script below to enable this feature.");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor your property portfolio</p>
      </div>

      <Tabs defaultValue="rentals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
          <TabsTrigger value="rentals" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            rentals
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            sales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate("/dashboard/landlord/add-property")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>


          {orphanedProps.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Ownership Mismatch Detected
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                      We found properties in the database, but they belong to a different User ID. This happens if you re-created your account.
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 shadow-md"
                    onClick={handleClaimProperties}
                    disabled={loading}
                  >
                    {loading ? "Claiming..." : "Claim All My Properties"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 mb-2">
                  <strong>Found these properties owned by someone else:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {orphanedProps.map(p => (
                      <li key={p.id}>
                        {p.listing_title} <span className="text-xs text-slate-500">(Owner: {p.user_id?.substring(0, 8)}...)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator className="my-4 bg-orange-200" />

                <p className="text-sm font-semibold text-slate-800">Alternative: Manual Fix</p>
                <div className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-hidden text-xs font-mono relative group">
                  <pre className="select-all whitespace-pre-wrap break-all pr-20 py-2 leading-relaxed opacity-90">{`-- Option 1: Run this to just claim these specific properties
UPDATE public.properties 
SET user_id = '${currentUserId}' 
WHERE user_id IN (${Array.from(new Set(orphanedProps.map(p => `'${p.user_id}'`))).join(', ')});

UPDATE public.sales_listings
SET user_id = '${currentUserId}'
WHERE user_id IN (${Array.from(new Set(orphanedProps.map(p => `'${p.user_id}'`))).join(', ')});`}</pre>
                  <Button
                    size="sm"
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
                    onClick={async () => {
                      const ids = Array.from(new Set(orphanedProps.map(p => `'${p.user_id}'`))).join(', ');
                      const script = `-- Claim All Properties\nUPDATE public.properties SET user_id = '${currentUserId}' WHERE user_id IN (${ids});\nUPDATE public.sales_listings SET user_id = '${currentUserId}' WHERE user_id IN (${ids});`;

                      try {
                        await navigator.clipboard.writeText(script);
                        toast.success("Script copied! Run this in Supabase SQL Editor.");
                      } catch (err) {
                        toast.error("Manual copy required.");
                      }
                    }}
                  >
                    Copy SQL
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  *If the "Claim All" button failed, please scroll down and run the <strong>Database Setup</strong> script first. It fixes the permissions.
                </p>
              </CardContent>
            </Card>
          )}

          {(showFixDialog || (properties.length === 0 && salesListings.length === 0 && !loading)) && (
            <Card className="border-indigo-200 bg-indigo-50 mb-6 border-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Visibility check: Database Setup Required
                </CardTitle>
                <CardDescription className="text-indigo-700 font-medium">
                  If you expect to see properties but they aren't appearing, you likely need to enable security permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-50 p-5 rounded-xl overflow-hidden text-xs font-mono relative group shadow-inner">
                  <pre className="select-all whitespace-pre-wrap break-all pr-20 py-2 leading-relaxed opacity-90">{`-- FIX LANDLORD VISIBILITY (Master Script)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_offers ENABLE ROW LEVEL SECURITY;

-- 1. Property Visibility
DROP POLICY IF EXISTS "Public view" ON public.properties;
CREATE POLICY "Public view" ON public.properties FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage" ON public.properties;
CREATE POLICY "Owner manage" ON public.properties FOR ALL USING (auth.uid() = user_id);

-- 2. Sales Visibility
DROP POLICY IF EXISTS "Public view" ON public.sales_listings;
CREATE POLICY "Public view" ON public.sales_listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage" ON public.sales_listings;
CREATE POLICY "Owner manage" ON public.sales_listings FOR ALL USING (auth.uid() = user_id);

-- 3. Applications (Landlords can see applications for their units)
DROP POLICY IF EXISTS "Landlord view apps" ON public.rental_applications;
CREATE POLICY "Landlord view apps" ON public.rental_applications FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()));

-- 4. Activity Signals
DROP POLICY IF EXISTS "Public view signals" ON public.investor_offers;
CREATE POLICY "Public view signals" ON public.investor_offers FOR SELECT USING (true);

-- 5. Helper for Account Recovery (Claim Properties)
CREATE OR REPLACE FUNCTION claim_orphaned_properties(old_owner_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  prop_count INT;
  sale_count INT;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  WITH p AS (UPDATE public.properties SET user_id = current_user_id WHERE user_id = old_owner_id RETURNING id)
  SELECT count(*) INTO prop_count FROM p;
  
  WITH s AS (UPDATE public.sales_listings SET user_id = current_user_id WHERE user_id = old_owner_id RETURNING id)
  SELECT count(*) INTO sale_count FROM s;

  RETURN json_build_object('success', true, 'claimed_properties', prop_count, 'claimed_sales', sale_count);
END;
$$;`}</pre>
                  <Button
                    size="sm"
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all"
                    onClick={() => {
                      const script = `-- Master Visibility Fix\nALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.sales_listings ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.investor_offers ENABLE ROW LEVEL SECURITY;\n\n-- 1. Property Visibility\nDROP POLICY IF EXISTS "Public view" ON public.properties;\nCREATE POLICY "Public view" ON public.properties FOR SELECT USING (true);\nDROP POLICY IF EXISTS "Owner manage" ON public.properties;\nCREATE POLICY "Owner manage" ON public.properties FOR ALL USING (auth.uid() = user_id);\n\n-- 2. Sales Visibility\nDROP POLICY IF EXISTS "Public view" ON public.sales_listings;\nCREATE POLICY "Public view" ON public.sales_listings FOR SELECT USING (true);\nDROP POLICY IF EXISTS "Owner manage" ON public.sales_listings;\nCREATE POLICY "Owner manage" ON public.sales_listings FOR ALL USING (auth.uid() = user_id);\n\n-- 3. Applications\nDROP POLICY IF EXISTS "Landlord view apps" ON public.rental_applications;\nCREATE POLICY "Landlord view apps" ON public.rental_applications FOR SELECT USING (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()));\n\n-- 4. Activity Signals\nDROP POLICY IF EXISTS "Public view signals" ON public.investor_offers;\nCREATE POLICY "Public view signals" ON public.investor_offers FOR SELECT USING (true);\n\n-- 5. Helper for Account Recovery (Claim Properties)\nCREATE OR REPLACE FUNCTION claim_orphaned_properties(old_owner_id UUID)\nRETURNS json\nLANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = public\nAS $$\nDECLARE\n  current_user_id UUID;\n  prop_count INT;\n  sale_count INT;\nBEGIN\n  current_user_id := auth.uid();\n  IF current_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;\n\n  WITH p AS (UPDATE public.properties SET user_id = current_user_id WHERE user_id = old_owner_id RETURNING id)\n  SELECT count(*) INTO prop_count FROM p;\n  \n  WITH s AS (UPDATE public.sales_listings SET user_id = current_user_id WHERE user_id = old_owner_id RETURNING id)\n  SELECT count(*) INTO sale_count FROM s;\n\n  RETURN json_build_object('success', true, 'claimed_properties', prop_count, 'claimed_sales', sale_count);\nEND;\n$$;\n\nGRANT EXECUTE ON FUNCTION claim_orphaned_properties(UUID) TO authenticated;\nGRANT EXECUTE ON FUNCTION claim_orphaned_properties(UUID) TO service_role;`;
                      navigator.clipboard.writeText(script);
                      toast.success("Master Fix Copied!");
                    }}
                  >
                    Copy SQL
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-white border border-indigo-100 rounded-lg text-sm text-indigo-900">
                  <p className="flex items-center gap-2 mb-2 font-bold">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">1</span>
                    Copy the script above.
                  </p>
                  <p className="flex items-center gap-2 font-bold">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">2</span>
                    Paste and run it in your <strong className="underline">Supabase SQL Editor</strong>.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-indigo-50/50 border-t border-indigo-100 py-3">
                <Button variant="ghost" className="text-indigo-400 text-xs hover:text-indigo-600" onClick={() => setShowFixDialog(false)}>I've already run this / Dismiss</Button>
              </CardFooter>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent>
                <div className="animate-pulse py-10 space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-40 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : properties.length === 0 && !error ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Property Listings
                </CardTitle>
                <CardDescription>View and manage all your rental properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first rental property to attract potential tenants.
                  </p>
                  <Button onClick={() => navigate("/dashboard/landlord/add-property")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>

                  {/* DEBUG INFO FOR USER */}
                  <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-md max-w-md mx-auto text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Debug Information</p>
                    <p className="text-xs text-slate-700 mb-1">
                      <strong>Your User ID:</strong> <span className="font-mono bg-white px-1 border rounded">{currentUserId || "Loading..."}</span>
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      If you see properties in Supabase but not here, check that the <code>user_id</code> column in the <code>properties</code> table matches the ID above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Your Property Listings
                  </CardTitle>
                  <CardDescription>Manage and review the properties you've added</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {properties.filter(p => !p.listing_category || p.listing_category === 'rental').map((p) => (
                      <Card key={p.id} className="border overflow-hidden">
                        {/* Image preview */}
                        <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                          {(() => {
                            // Handle different image data formats
                            let imageUrl = null;

                            if (p.images && Array.isArray(p.images) && p.images.length > 0) {
                              imageUrl = p.images[0];
                            } else if (p.images && typeof p.images === 'string') {
                              imageUrl = p.images;
                            } else if (p.images && typeof p.images === 'object' && (p.images as any).url) {
                              imageUrl = (p.images as any).url;
                            }

                            if (imageUrl && imageUrl !== "/placeholder.svg") {
                              return (
                                <img
                                  src={imageUrl}
                                  alt={`${p.listing_title} photo`}
                                  className="h-40 w-full object-cover"
                                  onError={(e) => {
                                    console.log(`❌ Image failed to load for ${p.listing_title}:`, imageUrl);
                                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                                  }}
                                  loading="lazy"
                                />
                              );
                            } else {
                              return (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                  <ImageIcon className="h-12 w-12 mb-2" />
                                  <span className="text-sm">No image</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base line-clamp-1">{p.listing_title}</CardTitle>
                          <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{p.address ? `${p.address}, ` : ''}{p.city}, {p.state}</span></div>
                            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>{p.monthly_rent}/mo</span></div>
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                                {p.bedrooms !== undefined && p.bedrooms !== null ?
                                  (p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} Bed`) :
                                  'Property'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center justify-center gap-1"
                              onClick={() => navigate(`/dashboard/landlord/add-property?prefill=${p.id}`)}
                              title="Edit listing"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center justify-center gap-1"
                              onClick={() => navigate(`/dashboard/rental-options/${p.id}`)}
                              title="View listing"
                            >
                              <Eye className="h-4 w-4" /> View
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex items-center justify-center gap-1"
                              onClick={() => handleDelete(p.id)}
                              title="Delete listing"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Removed placeholder sections (Property Management, Pricing Tools, Maintenance) per request */}
            </>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => navigate("/dashboard/landlord/add-property?category=sale")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sales Listing
            </Button>
          </div>

          {salesListings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Sales Listings
                </CardTitle>
                <CardDescription>Manage your units for sale or co-ownership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Sales Listings</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't listed any properties for sale yet.
                  </p>
                  <Button onClick={() => navigate("/dashboard/landlord/add-property?category=sale")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Sales Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {salesListings.map((p) => (
                <Card key={p.id} className="border overflow-hidden">
                  <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                    {(() => {
                      let imageUrl = null;
                      if (p.images && Array.isArray(p.images) && p.images.length > 0) {
                        imageUrl = p.images[0];
                      } else if (p.images && typeof p.images === 'string') {
                        imageUrl = p.images;
                      }

                      if (imageUrl && imageUrl !== "/placeholder.svg") {
                        return (
                          <img
                            src={imageUrl}
                            alt={`${p.listing_title} photo`}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                            loading="lazy"
                          />
                        );
                      } else {
                        return (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <span className="text-sm">No image</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-1">{p.listing_title}</CardTitle>
                    <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{p.address ? `${p.address}, ` : ''}{p.city}, {p.state}</span></div>
                      <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span>${p.sales_price}</span></div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-1"
                        onClick={() => navigate(`/dashboard/landlord/add-property?prefill=${p.id}&category=sale`)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center justify-center gap-1"
                        onClick={() => navigate(`/dashboard/rental-options/${p.id}?type=sale`)}
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex items-center justify-center gap-1"
                        onClick={() => handleDeleteSales(p.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}
