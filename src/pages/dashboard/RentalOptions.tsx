import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home, Filter, Sparkles, Zap } from "lucide-react";
import { fetchProperties, Property } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { MessageButton } from "@/components/MessageButton";
import { MapModal } from "@/components/map/MapModal";
import { QuickApplyModal } from "@/components/application/QuickApplyModal";
import { checkProfileCompleteness, getTenantProfileForApplication } from "@/utils/profileCompleteness";
import { submitQuickApplication, hasUserApplied } from "@/services/quickApplyService";

export default function RentalOptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    property_type: "",
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [naturalQuery, setNaturalQuery] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  
  // Quick Apply states
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [quickApplyProperty, setQuickApplyProperty] = useState<Property | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isSubmittingQuickApply, setIsSubmittingQuickApply] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log("🔍 [RentalOptions.tsx] loadProperties starting with filters:", filters);
      const processedFilters = {
        location: filters.location || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
        property_type: filters.property_type || undefined,
      };
      console.log("🔍 [RentalOptions.tsx] Processed filters:", processedFilters);
      console.log("🔍 [RentalOptions.tsx] Calling fetchProperties...");
      const data = await fetchProperties(processedFilters);
      console.log("✅ [RentalOptions.tsx] fetchProperties returned:", data.length, "properties");
      if (data.length > 0) {
        console.log("📋 [RentalOptions.tsx] First property:", {
          id: data[0].id,
          title: data[0].listing_title,
          status: data[0].status,
          monthly_rent: data[0].monthly_rent
        });
      }
      setProperties(data);
    } catch (error) {
      console.error("❌ [RentalOptions.tsx] Error loading properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleViewOnMap = (property: Property) => {
    setSelectedProperty(property);
    setMapModalOpen(true);
  };

  // AI Natural Language Search
  const handleNaturalSearch = async () => {
    if (!naturalQuery.trim()) return;
    try {
      setAiProcessing(true);
      toast.info("Analyzing your request...");
      const prompt = `Parse this rental search query and extract the filters. Return ONLY a JSON object with these fields: location (city/area or empty string), minPrice (number or empty string), maxPrice (number or empty string), bedrooms ("0" for studio, "1","2","3","4" or empty string), property_type (or empty string). Query: "${naturalQuery}". Example: {"location":"downtown","minPrice":"","maxPrice":"1500","bedrooms":"2","property_type":"apartment"}`;
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { prompt },
      });
      if (error) throw new Error("AI search failed");
      const resultText = data.text || "";
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setFilters({ location: parsed.location || "", minPrice: parsed.minPrice || "", maxPrice: parsed.maxPrice || "", bedrooms: parsed.bedrooms || "", property_type: parsed.property_type || "" });
      toast.success("Filters updated! Searching...");
      loadProperties();
    } catch (error) {
      console.error("AI search error:", error);
      toast.error("Failed to process search. Try using the filters below.");
    } finally {
      setAiProcessing(false);
    }
  };

  const applyFilters = () => {
    loadProperties();
  };

  // Quick Apply Handlers
  const handleQuickApplyClick = async (property: Property) => {
    if (!user) {
      toast.error("Please log in to apply");
      return;
    }

    // Check if already applied
    const applied = await hasUserApplied(user.id, property.id);
    if (applied) {
      toast.error("You have already applied to this property");
      setHasApplied(true);
      return;
    }

    // Check profile completeness
    const completeness = await checkProfileCompleteness(user.id);

    if (!completeness.isComplete) {
      const missing = [
        ...completeness.missingFields,
        ...completeness.missingDocuments
      ];

      toast.error(
        `Please complete your profile first. Missing: ${missing.join(', ')}`,
        { duration: 5000 }
      );

      // Redirect to profile page
      setTimeout(() => {
        navigate('/dashboard/profile');
      }, 2000);
      return;
    }

    // Load profile data
    const data = await getTenantProfileForApplication(user.id);
    if (!data) {
      toast.error("Could not load profile data");
      return;
    }

    setProfileData(data);
    setQuickApplyProperty(property);
    setShowQuickApplyModal(true);
  };

  const handleQuickApplyConfirm = async (message: string) => {
    if (!user || !quickApplyProperty) return;

    setIsSubmittingQuickApply(true);

    try {
      console.log("Starting quick application submission...");
      const applicationId = await submitQuickApplication({
        user_id: user.id,
        property_id: quickApplyProperty.id,
        message,
      });

      if (!applicationId) {
        throw new Error("Failed to submit application - no ID returned");
      }

      console.log("Application submitted successfully with ID:", applicationId);
      toast.success("Application submitted successfully!");
      setShowQuickApplyModal(false);
      setHasApplied(true);

      // Optionally navigate to applications page
      setTimeout(() => {
        navigate('/dashboard/applications');
      }, 1500);
    } catch (error) {
      console.error("Error submitting quick application:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to submit application: ${errorMessage}`);
    } finally {
      setIsSubmittingQuickApply(false);
    }
  };

  const getPropertyTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      "sharing-room": "Sharing Room",
      "sharing-apartment": "Sharing Apartment (Cando)",
      "sharing-house": "Sharing House",
      "single-one-bed": "Single One Bed (Cando)",
      studio: "Studio",
      "two-bed": "Two Bed (Cando)",
      "entire-house": "Entire House or Cando",
    };
    return typeMap[type] || type;
  };

  const getBedroomTypeDisplay = (property: Property) => {
    if (property.bedrooms !== undefined && property.bedrooms !== null) {
      if (property.bedrooms === 0) return "Studio";
      if (property.bedrooms === 1) return "1 Bed";
      if (property.bedrooms === 2) return "2 Bed";
      if (property.bedrooms === 3) return "3 Bed";
      if (property.bedrooms >= 4) return `${property.bedrooms} Bed`;
    }
    const type = property.property_type?.toLowerCase() || '';
    if (type.includes('studio')) return "Studio";
    if (type.includes('one-bed') || type.includes('single-one-bed')) return "1 Bed";
    if (type.includes('two-bed')) return "2 Bed";
    if (type.includes('three-bed')) return "3 Bed";
    return property.bedrooms ? `${property.bedrooms} Bed` : "Apartment";
  };

  const formatAvailableDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    try {
      return d.toLocaleDateString();
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg orange-purple-gradient shadow-md">
              <Home className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gradient">
                Rental Options
              </h1>
              <p className="text-sm text-muted-foreground">Find your perfect rental property</p>
            </div>
          </div>
        </header>
        <section className="mb-6">
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-white to-orange-50 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <label className="text-sm font-semibold text-purple-900">AI Smart Search</label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you are looking for, e.g. 2BR under $1500 near subway"
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNaturalSearch()}
                  className="h-12 text-sm border-purple-200 focus:border-purple-500"
                />
                <Button
                  onClick={handleNaturalSearch}
                  disabled={!naturalQuery.trim() || aiProcessing}
                  className="h-12 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold px-6"
                >
                  <Sparkles className={`h-4 w-4 mr-2 ${aiProcessing ? "animate-spin" : ""}`} />
                  {aiProcessing ? "AI..." : "Search"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Describe what you are looking for in plain language</p>
            </CardContent>
          </Card>
        </section>
        <section className="mb-6">
          <Card className="border-2 border-transparent bg-gradient-to-br from-orange-100/80 via-purple-100/60 to-pink-100/70 shadow-2xl backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
            <CardHeader className="relative bg-gradient-to-r from-orange-500/90 via-purple-500/90 to-pink-500/90 pb-4 border-b-2 border-white/30">
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold drop-shadow-md">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Filter className="h-5 w-5" />
                </div>
                Search Filters
              </CardTitle>
              <p className="text-white/90 text-xs mt-1">Find your perfect rental property</p>
            </CardHeader>
            <CardContent className="p-5 relative bg-white/95 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-orange-500">📍</span> Location
                  </label>
                  <Input
                    placeholder="Enter city"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="h-10 text-sm border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-green-500">💰</span> Min Price
                  </label>
                  <Input
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="h-10 text-sm border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-purple-500">💵</span> Max Price
                  </label>
                  <Input
                    placeholder="$5000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="h-10 text-sm border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-blue-500">🛏️</span> Bedrooms
                  </label>
                  <select
                    value={filters.bedrooms || "any"}
                    onChange={(e) => handleFilterChange("bedrooms", e.target.value === "any" ? "" : e.target.value)}
                    className="w-full rounded-md border-2 border-slate-300 bg-white px-3 py-2 text-sm h-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="any">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  onClick={applyFilters}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        <main>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse border-2 border-slate-200/60 shadow-lg">
                  <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-slate-200 rounded"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-9 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card className="border-2 border-purple-200/50 shadow-xl bg-white/95">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Search className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-medium text-foreground">No Properties Found</h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    No properties match your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="group overflow-hidden border-2 border-slate-200/60 hover:border-orange-400 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white transform hover:-translate-y-1"
                  onClick={() => window.open(`/dashboard/rent/${property.id}`, '_blank')}
                >
                  <div className="relative overflow-hidden" aria-label={`Listing image for ${property.listing_title}`}>
                    <img
                      src={property.images?.[0] || "/placeholder.svg"}
                      alt={`${property.listing_title} photo`}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className="absolute top-3 left-3 text-xs bg-white/95 text-slate-900 border-0 shadow-md">
                      {getPropertyTypeDisplay(property.property_type)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <p className="text-sm font-bold text-slate-700">
                        Type: {getPropertyTypeDisplay(property.property_type)}
                      </p>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                      {property.listing_title}
                    </h3>
                    <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-lg p-3 space-y-2.5 text-sm border-2 border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div>
                          <div className="flex items-baseline font-bold text-primary">
                            <span className="text-xl">${property.monthly_rent}</span>
                            <span className="text-sm font-medium text-muted-foreground ml-1">/mo</span>
                          </div>
                        </div>
                        {formatAvailableDate(property.available_date) && (
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">
                              {formatAvailableDate(property.available_date)}
                            </p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{getBedroomTypeDisplay(property)}</p>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOnMap(property);
                        }}
                        className="cursor-pointer hover:text-primary transition-colors"
                      >
                        <p className="text-xs text-muted-foreground font-medium">Location</p>
                        <div className="flex items-start gap-1.5 text-xs font-bold text-slate-900">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="line-clamp-2">
                            {property.address ? `${property.address}, ` : ''}{property.city}, {property.state}
                          </span>
                        </div>
                      </div>
                      {property.nearby_amenities && property.nearby_amenities.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Nearby</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {property.nearby_amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 font-normal">
                                {amenity}
                              </Badge>
                            ))}
                            {property.nearby_amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal">
                                +{property.nearby_amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/dashboard/rent/${property.id}`, '_blank');
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        View Details
                      </Button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <MessageButton
                          landlordId={property.user_id}
                          propertyId={property.id}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickApplyClick(property);
                      }}
                      className="w-full mt-2 h-8 text-xs button-gradient text-white font-semibold flex items-center justify-center gap-1"
                      disabled={hasApplied}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {hasApplied ? "Already Applied" : "Quick Apply"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        {isMapModalOpen && (
          <MapModal
            property={selectedProperty}
            isOpen={isMapModalOpen}
            onClose={() => setMapModalOpen(false)}
          />
        )}
        {showQuickApplyModal && quickApplyProperty && (
          <QuickApplyModal
            open={showQuickApplyModal}
            onOpenChange={setShowQuickApplyModal}
            property={quickApplyProperty}
            profileData={profileData}
            onConfirm={handleQuickApplyConfirm}
            isSubmitting={isSubmittingQuickApply}
          />
        )}
      </div>
    </div>
  );
}