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
import { MapPin, Search, Home, Filter } from "lucide-react";
import { fetchProperties, Property } from "@/services/propertyService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { MessageButton } from "@/components/MessageButton";
import { MapModal } from "@/components/map/MapModal";

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

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log("Loading properties with filters:", filters);
      const processedFilters = {
        location: filters.location || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
        property_type: filters.property_type || undefined,
      };
      console.log("Processed filters:", processedFilters);
      const data = await fetchProperties(processedFilters);
      console.log("Fetched properties:", data);
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
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

  const applyFilters = () => {
    loadProperties();
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
    // If bedrooms is available, use that
    if (property.bedrooms !== undefined && property.bedrooms !== null) {
      if (property.bedrooms === 0) return "Studio";
      if (property.bedrooms === 1) return "1 Bed";
      if (property.bedrooms === 2) return "2 Bed";
      if (property.bedrooms === 3) return "3 Bed";
      if (property.bedrooms >= 4) return `${property.bedrooms} Bed`;
    }

    // Fallback to property type parsing
    const type = property.property_type?.toLowerCase() || '';
    if (type.includes('studio')) return "Studio";
    if (type.includes('one-bed') || type.includes('single-one-bed')) return "1 Bed";
    if (type.includes('two-bed')) return "2 Bed";
    if (type.includes('three-bed')) return "3 Bed";

    // Default fallback
    return property.bedrooms ? `${property.bedrooms} Bed` : "Apartment";
  };

  // Safely format available dates to avoid runtime errors
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
        {/* Header */}
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

        {/* Search Filters */}
        <section className="mb-6">
          <Card className="border-2 border-transparent bg-gradient-to-br from-orange-100/80 via-purple-100/60 to-pink-100/70 shadow-2xl backdrop-blur-sm overflow-hidden relative">
            {/* Animated background effect */}
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
                {/* Location */}
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

                {/* Min Price */}
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

                {/* Max Price */}
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

                {/* Bedrooms */}
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

              {/* Search Button - Full Width Below */}
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

        {/* Properties Grid */}
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
                  onClick={() => window.open(`/dashboard/rental-options/${property.id}`, '_blank')}
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
                    <h3 className="text-sm font-bold text-slate-900 mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                      {property.listing_title}
                    </h3>

                    {/* Property Details */}
                    <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-lg p-3 space-y-2.5 text-sm border-2 border-slate-100 shadow-sm">
                      {/* Price and Availability */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Price</p>
                          <div className="flex items-baseline font-bold text-primary">
                            <span className="text-base">${property.monthly_rent}</span>
                            <span className="text-xs font-medium text-muted-foreground ml-1">/mo</span>
                          </div>
                        </div>
                        {formatAvailableDate(property.available_date) && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium">Available</p>
                            <p className="text-xs font-bold text-slate-900">
                              {formatAvailableDate(property.available_date)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Type</p>
                        <p className="text-xs font-bold text-slate-900">{getBedroomTypeDisplay(property)} • {getPropertyTypeDisplay(property.property_type)}</p>
                      </div>

                      {/* Location */}
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

                      {/* Nearby Amenities */}
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/dashboard/rental-options/${property.id}`, '_blank');
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
                        if (user) {
                          navigate(`/dashboard/rental-application/${property.id}`);
                        } else {
                          toast.error("Please log in to apply for a rental.");
                        }
                      }}
                      className="w-full mt-2 h-8 text-xs button-gradient text-white font-semibold"
                    >
                      Apply Now
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
      </div>
    </div>
  );
}
