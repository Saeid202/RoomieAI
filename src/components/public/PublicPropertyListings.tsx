import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon, AlertTriangle, Home, User, Square, Bed, Bath, Car, Search, Filter, Calendar } from "lucide-react";
import { fetchPublicProperties, PublicProperty, PublicPropertyFilters } from "@/services/publicPropertyService";
import { Link } from "react-router-dom";

interface PublicPropertyListingsProps {
  limit?: number;
  showFilters?: boolean;
  showSearch?: boolean;
}

export function PublicPropertyListings({ limit = 6, showFilters = true, showSearch = true }: PublicPropertyListingsProps) {
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PublicPropertyFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProperties();
  }, [filters, searchTerm]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const searchFilters = { ...filters };
      if (searchTerm) {
        searchFilters.search = searchTerm;
      }
      
      const result = await fetchPublicProperties(searchFilters, 1, limit);
      setProperties(result.properties);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PublicPropertyFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatPrice = (price: number | undefined, type: 'rental' | 'sales') => {
    if (!price) return 'Price not available';
    if (type === 'rental') {
      return `$${price.toLocaleString()}/mo`;
    } else {
      return `$${price.toLocaleString()}`;
    }
  };

  const getPropertyImage = (property: PublicProperty) => {
    if (property.images && property.images.length > 0) {
      return property.images[0];
    }
    // Return a placeholder image
    return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {showFilters && (
              <>
                <Select onValueChange={(value) => handleFilterChange('property_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('bedrooms', value ? parseInt(value) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bed</SelectItem>
                    <SelectItem value="2">2 Beds</SelectItem>
                    <SelectItem value="3">3 Beds</SelectItem>
                    <SelectItem value="4">4+ Beds</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('listing_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Listing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">For Rent</SelectItem>
                    <SelectItem value="sales">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {total > 0 ? `Showing ${properties.length} of ${total} properties` : 'No properties found'}
        </p>
      </div>

      {/* Property Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={getPropertyImage(property)}
                alt={property.listing_title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant={property.listing_type === 'rental' ? 'default' : 'secondary'}>
                  {property.listing_type === 'rental' ? 'For Rent' : 'For Sale'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Property Title and Price */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.listing_title}</h3>
                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(
                    property.listing_type === 'rental' ? property.monthly_rent : property.sales_price,
                    property.listing_type
                  )}
                </p>
              </div>

              {/* Property Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.address}, {property.city}, {property.state}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} bed
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} bath
                    </div>
                  )}
                  {property.square_footage && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.square_footage.toLocaleString()} sqft
                    </div>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-3">
                <Badge variant="outline" className="text-xs">
                  {property.property_type}
                </Badge>
              </div>

              {/* Listed By and Property Owner */}
              <div className="space-y-2 mb-3">
                {(() => {
                  console.log('🏠 UI Property Data:', { 
                    propertyId: property.id, 
                    landlordName: property.landlord_name, 
                    propertyOwner: property.property_owner 
                  });
                  return null;
                })()}
                {property.landlord_name && (
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    Listed by {property.landlord_name}
                  </div>
                )}
                {property.property_owner && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Home className="h-4 w-4 mr-1" />
                    Property Owner: {property.property_owner}
                  </div>
                )}
                {!property.landlord_name && !property.property_owner && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Debug: No owner data available
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Link to={`/property/${property.id}`}>
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {properties.length === 0 && !loading && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms to find properties that match your criteria.
          </p>
        </div>
      )}

      {/* Load More Button */}
      {properties.length < total && properties.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => {/* TODO: Load more */}}>
            Load More Properties
          </Button>
        </div>
      )}
    </div>
  );
}
