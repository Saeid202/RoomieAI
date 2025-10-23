import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPropertiesByOwnerId, Property, deleteProperty } from "@/services/propertyService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProperties([]);
          return;
        }
        const list = await getPropertiesByOwnerId(user.id);
        console.log("🔍 Properties loaded:", list);
        if (mounted) setProperties(list);
      } catch (e) {
        console.error("Failed to load landlord properties", e);
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
      ) : properties.length === 0 ? (
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
                        } else if (p.images && typeof p.images === 'object' && p.images.url) {
                          imageUrl = p.images.url;
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