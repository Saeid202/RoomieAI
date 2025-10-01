import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { fetchProperties, Property } from "@/services/propertyService";
import { Link } from "react-router-dom";

export default function RentalOptionsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    property_type: ""
  });

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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadProperties();
  };

  const getPropertyTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'studio': 'Studio Condominium',
      'one-bed-room-share-cando': 'Shared One-Bedroom Condominium',
      'two-bed-room-share-cando': 'Shared Two-Bedroom Condominium',
      'entire-one-bed-room-cando': 'Entire One-Bedroom Condominium',
      'entire-two-bed-room-cando': 'Entire Two-Bedroom Condominium',
      'room-from-house': 'Private Room in a House',
      'entire-house': 'Entire House',
      'entire-basement': 'Entire Basement Unit',
      'room-from-basement': 'Private Room in a Basement',
      'shared-room': 'Shared Room (two occupants per room)'
    };
    return typeMap[type] || type;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Options</h1>
          <p className="text-muted-foreground mt-1">Browse all available properties listed on our platform</p>
        </div>
      </div>

      {/* Debug info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm">Debug: Loading = {loading.toString()}, Properties count = {properties.length}</p>
          {properties.length > 0 && (
            <p className="text-sm">First property: {properties[0]?.listing_title}</p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Find properties that match your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Location (city)"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
            <Input
              placeholder="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
            <Select value={filters.bedrooms || undefined} onValueChange={(value) => handleFilterChange("bedrooms", value === "any" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyFilters}>Search</Button>
          </div>
        </CardContent>
      </Card>

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
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium">No Properties Found</h3>
            <p className="text-muted-foreground mt-2">
              No properties match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <div className="relative" aria-label={`Listing image for ${property.listing_title}`}>
                <img src={property.images?.[0] || "/placeholder.svg"} alt={`${property.listing_title} photo`} className="h-48 w-full object-cover rounded-t-lg" loading="lazy" />
                <Badge className="absolute top-3 left-3" variant="secondary">
                  {getPropertyTypeDisplay(property.property_type)}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.listing_title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{property.description}</p>
                
                <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{property.city}, {property.state}</span>
                </div>

                <div className="flex gap-3 mb-3 text-sm text-muted-foreground">
                  <span>{(property.bedrooms ?? 0)} bd</span>
                  <span>{(property.bathrooms ?? 0)} ba</span>
                  {property.square_footage ? (
                    <span>{property.square_footage} sq ft</span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-semibold text-lg text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span>{property.monthly_rent}</span>
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  {formatAvailableDate(property.available_date) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatAvailableDate(property.available_date)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" variant="outline" asChild>
                    <Link to={`/dashboard/rental-options/${property.id}`}>View Details</Link>
                  </Button>
                  <Button className="flex-1" variant="default" asChild>
                    <Link to={`/dashboard/rental-application/${property.id}`}>Rent</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}