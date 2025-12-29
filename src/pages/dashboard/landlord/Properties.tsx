import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPropertiesByOwnerId, Property, deleteProperty } from "@/services/propertyService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
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
        console.log("🔍 Properties loaded:", list);
        if (mounted) setProperties(list);

        // DIAGNOSTIC CHECK: If we found no properties, check if ANY exist in the DB at all
        // (This helps detect if the user has created properties under a DIFFERENT account/ID)
        if (list.length === 0) {
          const { data: allProps, error: allPropsError } = await supabase
            .from('properties' as any)
            .select('id, listing_title, user_id')
            .limit(3);

          if (!allPropsError && allProps && allProps.length > 0) {
            console.warn("Found orphaned properties:", allProps);
            if (mounted) setOrphanedProps(allProps);
          }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your rental properties</p>
        </div>
        <Button onClick={() => navigate("/dashboard/landlord/add-property")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {orphanedProps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ownership Mismatch Detected
            </CardTitle>
            <CardDescription className="text-orange-700">
              We found properties in the database, but they belong to a different User ID. This happens if you re-created your account.
            </CardDescription>
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
            <p className="text-sm mt-4 font-semibold text-slate-800">To claim these properties, run this SQL:</p>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-xs font-mono relative mt-2">
              <pre className="select-text whitespace-pre-wrap break-all">{`-- Run this in Supabase SQL Editor
UPDATE public.properties 
SET user_id = '${currentUserId}' 
WHERE user_id = '${orphanedProps[0]?.user_id}';`}</pre>
              <Button
                size="sm"
                className="absolute top-2 right-2 bg-white text-black hover:bg-slate-200"
                onClick={async () => {
                  const oldId = orphanedProps[0]?.user_id;
                  const script = `UPDATE public.properties SET user_id = '${currentUserId}' WHERE user_id = '${oldId}';`;

                  try {
                    await navigator.clipboard.writeText(script);
                    toast.success("SQL Copied to clipboard!");
                  } catch (err) {
                    // Fallback for non-secure contexts
                    const textArea = document.createElement("textarea");
                    textArea.value = script;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      toast.success("SQL Copied to clipboard!");
                    } catch (err) {
                      toast.error("Could not auto-copy. Please manually select and copy the text.");
                    }
                    document.body.removeChild(textArea);
                  }
                }}
              >
                Copy SQL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showFixDialog && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription className="text-red-700">
              We found some issues accessing your properties. This is usually due to missing security policies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-xs font-mono relative">
              <pre>{FIX_RLS_SCRIPT}</pre>
              <Button
                size="sm"
                className="absolute top-2 right-2 bg-white text-black hover:bg-slate-200"
                onClick={() => {
                  navigator.clipboard.writeText(FIX_RLS_SCRIPT);
                  toast.success("SQL Script Copied!");
                }}
              >
                Copy SQL
              </Button>
            </div>
            <p className="text-sm mt-4 text-slate-700">
              Please copy the script above and run it in your <strong>Supabase SQL Editor</strong> to fix the permissions.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setShowFixDialog(false)}>Dismiss</Button>
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
                {properties.map((p) => (
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
    </div>
  );
}