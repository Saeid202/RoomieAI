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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar, DollarSign, Search, Home, Filter } from "lucide-react";
import { fetchProperties, Property } from "@/services/propertyService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { MessageButton } from "@/components/MessageButton";
import { MapModal } from "@/components/map/MapModal";
import { 
  EnhancedPageLayout,
  EnhancedHeader,
  EnhancedCard,
  EnhancedButton,
  EnhancedSearch,
  EnhancedFilter,
  EnhancedEmptyState,
  StatCard
} from "@/components/ui/design-system";

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
    <EnhancedPageLayout>
      {/* Enhanced Header */}
      <EnhancedHeader
        title="Rental Options"
        subtitle="Find your perfect rental property"
        actionButton={
          <EnhancedButton
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </EnhancedButton>
        }
      />

      {/* Enhanced Filters */}
      <EnhancedCard>
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
            <div className="border-2 border-gray-300 rounded-full size-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
              <button
                onClick={applyFilters}
                className="!size-full min-w-full min-h-full flex items-center justify-center"
              >
                <Search className="size-4 text-primary" />
              </button>
            </div>
            <EnhancedSearch
              placeholder="Location (city)"
              value={filters.location}
              onChange={(value) => handleFilterChange("location", value)}
            />
            <EnhancedSearch
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(value) => handleFilterChange("minPrice", value)}
            />
            <EnhancedSearch
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(value) => handleFilterChange("maxPrice", value)}
            />
            <EnhancedFilter
              value={filters.bedrooms || "any"}
              onValueChange={(value) => handleFilterChange("bedrooms", value === "any" ? "" : value)}
              options={[
                { value: "any", label: "Any" },
                { value: "0", label: "Studio" },
                { value: "1", label: "1 Bedroom" },
                { value: "2", label: "2 Bedrooms" },
                { value: "3", label: "3 Bedrooms" },
                { value: "4", label: "4+ Bedrooms" }
              ]}
              placeholder="Bedrooms"
            />
            <EnhancedButton onClick={applyFilters} className="hidden md:block">
              <Search className="h-4 w-4 mr-2" />
              Search
            </EnhancedButton>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
                <div className="h-6 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EnhancedEmptyState
          icon={Search}
          title="No Properties Found"
          description="No properties match your current filters. Try adjusting your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <EnhancedCard
              key={property.id}
              className="overflow-hidden border-2 border-transparent hover:border-primary"
            >
              <div
                className="relative"
                aria-label={`Listing image for ${property.listing_title}`}
              >
                <img
                  src={property.images?.[0] || "/placeholder.svg"}
                  alt={`${property.listing_title} photo`}
                  className="h-48 w-full object-cover rounded-t-lg"
                  loading="lazy"
                />
                <Badge className="absolute top-3 left-3" variant="secondary">
                  {getPropertyTypeDisplay(property.property_type)}
                </Badge>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {property.listing_title}
                </h3>

                {/* Property Details Section */}
                <div className="border rounded-lg p-3 mt-2 space-y-3 text-sm">
                  {/* Price and Availability */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <div className="flex items-baseline font-bold text-primary">
                        <span className="text-lg">${property.monthly_rent}</span>
                        <span className="text-xs font-medium text-muted-foreground">/month</span>
                      </div>
                    </div>
                    {formatAvailableDate(property.available_date) && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="font-bold">
                          {formatAvailableDate(property.available_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-bold">{getBedroomTypeDisplay(property)} in a {getPropertyTypeDisplay(property.property_type)}</p>
                  </div>

                  {/* Location */}
                  <div onClick={() => handleViewOnMap(property)} className="cursor-pointer hover:text-primary transition-colors">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <div className="flex items-start gap-2 font-bold">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2">
                        {property.address ? `${property.address}, ` : ''}{property.city}, {property.state}
                      </span>
                    </div>
                  </div>

                  {/* Nearby Amenities */}
                  {property.nearby_amenities && property.nearby_amenities.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nearby</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {property.nearby_amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="font-normal text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.nearby_amenities.length > 3 && (
                          <Badge variant="outline" className="font-normal text-xs">
                            +{property.nearby_amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    onClick={() => navigate(`/dashboard/rental-options/${property.id}`)}
                    variant="outline"
                  >
                    View Details
                  </Button>
                  <MessageButton
                    landlordId={property.user_id}
                    propertyId={property.id}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                   <EnhancedButton
                    onClick={() => {
                      if (user) {
                        navigate(`/dashboard/rental-application/${property.id}`);
                      } else {
                        toast.error("Please log in to apply for a rental.");
                      }
                    }}
                    className="w-full"
                  >
                    Apply Now
                  </EnhancedButton>
                </div>
              </CardContent>
            </EnhancedCard>
          ))}
        </div>
      )}
      <MapModal 
        property={selectedProperty} 
        isOpen={isMapModalOpen} 
        onClose={() => setMapModalOpen(false)} 
      />
    </EnhancedPageLayout>
  );
}
