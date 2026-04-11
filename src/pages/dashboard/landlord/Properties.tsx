import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon, AlertTriangle, Home, ShieldCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPropertiesByOwnerId, Property, deleteProperty, getSalesListingsByOwnerId, SalesListing, deleteSalesListing, claimProperties, getArchivedProperties, relistProperty } from "@/services/propertyService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";


export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [salesListings, setSalesListings] = useState<SalesListing[]>([]);
  const [archivedProperties, setArchivedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        console.log("🔍 [Properties.tsx] useEffect starting...");
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("❌ [Properties.tsx] No user found in auth");
          setProperties([]);
          return;
        }

        console.log("✅ [Properties.tsx] User authenticated:", user.id, "Email:", user.email);

        console.log("🔍 [Properties.tsx] Calling getPropertiesByOwnerId...");
        const list = await getPropertiesByOwnerId(user.id);
        console.log("✅ [Properties.tsx] getPropertiesByOwnerId returned:", list.length, "properties");
        
        console.log("🔍 [Properties.tsx] Calling getSalesListingsByOwnerId...");
        const sList = await getSalesListingsByOwnerId(user.id);
        console.log("✅ [Properties.tsx] getSalesListingsByOwnerId returned:", sList.length, "listings");
        
        console.log("🔍 [Properties.tsx] Calling getArchivedProperties...");
        const archived = await getArchivedProperties(user.id);
        console.log("✅ [Properties.tsx] getArchivedProperties returned:", archived.length, "properties");
        
        // Debug: Log first property details
        if (list.length > 0) {
          console.log("📋 [Properties.tsx] First rental property:", {
            id: list[0].id,
            title: list[0].listing_title,
            user_id: list[0].user_id,
            status: list[0].status,
            created_at: list[0].created_at
          });
        } else {
          console.log("⚠️ [Properties.tsx] No rental properties found for user:", user.id);
          console.log("⚠️ [Properties.tsx] User email:", user.email);
        }

        if (mounted) {
          console.log("🔍 [Properties.tsx] Setting state with", list.length, "properties");
          setProperties(list);
          setSalesListings(sList);
          setArchivedProperties(archived);
        }
      } catch (e: any) {
        console.error("❌ [Properties.tsx] Failed to load landlord properties", e);
        if (mounted) {
          setError(e.message || "Failed to load properties");
        }
      } finally {
        if (mounted) {
          console.log("✅ [Properties.tsx] Setting loading=false");
          setLoading(false);
        }
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

  const handleRelist = async (id: string) => {
    try {
      const confirmed = window.confirm("Re-list this property? It will become available for rent again.");
      if (!confirmed) return;
      await relistProperty(id);
      // Move from archived to active
      const property = archivedProperties.find(p => p.id === id);
      if (property) {
        setArchivedProperties((prev) => prev.filter(p => p.id !== id));
        setProperties((prev) => [...prev, { ...property, status: 'active' }]);
      }
      toast.success("Property re-listed successfully");
    } catch (e: any) {
      console.error("Re-list failed", e);
      toast.error(e?.message || "Failed to re-list property");
    }
  };


  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor your property portfolio</p>
      </div>

      <Tabs defaultValue="rentals" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 max-w-4xl">
          <TabsTrigger value="rentals" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Rentals
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Archived ({archivedProperties.length})
          </TabsTrigger>
          <TabsTrigger value="screening" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Tenant Screening
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rentals" className="space-y-6">
          <div className="flex justify-end mb-4">
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
                    {properties.filter(p => !p.listing_category || p.listing_category === 'rental' || p.listing_category === 'rent').map((p) => (
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
                          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Rental
                          </div>
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
                              onClick={() => navigate(`/dashboard/rent/${p.id}`)}
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
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      For Sale
                    </div>
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
                        onClick={() => navigate(`/dashboard/buy/${p.id}?type=sale`)}
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

        <TabsContent value="archived" className="space-y-6">
          {archivedProperties.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Archived Properties
                </CardTitle>
                <CardDescription>Properties that have been rented and are no longer available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Archived Properties</h3>
                  <p className="text-muted-foreground">
                    When you sign a lease contract, the property will be automatically archived here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Archived Properties
                </CardTitle>
                <CardDescription>Properties currently rented - you can re-list them when the lease ends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {archivedProperties.map((p) => (
                    <Card key={p.id} className="border overflow-hidden bg-gray-50">
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
                                className="h-40 w-full object-cover opacity-75"
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
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Archived
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-1">{p.listing_title}</CardTitle>
                        <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{p.address ? `${p.address}, ` : ''}{p.city}, {p.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>${p.monthly_rent}/mo</span>
                          </div>
                          {p.archived_at && (
                            <div className="text-xs text-gray-500 mt-2">
                              Archived: {new Date(p.archived_at).toLocaleDateString()}
                            </div>
                          )}
                          {p.archive_reason && (
                            <div className="text-xs text-gray-500">
                              Reason: {p.archive_reason.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center justify-center gap-1"
                            onClick={() => navigate(`/dashboard/rental-options/${p.id}`)}
                            title="View property details"
                          >
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <Button
                            variant="default"
                            className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleRelist(p.id)}
                            title="Re-list this property"
                          >
                            <Plus className="h-4 w-4" /> Re-list
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="screening" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Tenant Background Screening Services
              </CardTitle>
              <CardDescription>
                Protect your investment with comprehensive tenant screening
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Professional Tenant Screening Made Easy
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  We've partnered with leading tenant screening providers to help you make informed decisions about your rental applications.
                  These trusted services offer comprehensive background checks, credit reports, and rental history verification to ensure
                  you find reliable tenants for your properties.
                </p>
              </div>

              <Separator />

              {/* Screening Partners */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Our Screening Partners</h3>

                {/* Openroom */}
                <Card className="border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-blue-600 mb-2">Openroom</CardTitle>
                        <CardDescription className="text-base">
                          Canada's Leading Tenant Screening Platform
                        </CardDescription>
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Recommended
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Openroom is a comprehensive tenant screening solution designed specifically for Canadian landlords.
                      Their platform provides instant access to credit reports, criminal background checks, and rental history
                      verification, helping you make confident leasing decisions while staying compliant with privacy regulations.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900">Key Features:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Comprehensive credit reports from Equifax and TransUnion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Criminal background checks across Canada</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Employment and income verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Previous landlord references and rental history</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Fast turnaround time with instant digital reports</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Privacy-compliant and secure data handling</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open('https://openroom.ca/login/', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Openroom
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Important Screening Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>Legal Compliance:</strong> Always ensure your tenant screening practices comply with federal and provincial
                      privacy laws, human rights codes, and fair housing regulations.
                    </p>
                    <p>
                      <strong>Applicant Consent:</strong> Obtain written consent from applicants before conducting any background checks
                      or credit inquiries.
                    </p>
                    <p>
                      <strong>Fair Assessment:</strong> Use screening results as one factor in your decision-making process, and apply
                      consistent criteria to all applicants.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
}
