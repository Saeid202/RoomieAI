import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, MapPin, DollarSign, Pencil, Eye, Trash2, Image as ImageIcon, AlertTriangle, Home, User, Square, Bed, Bath, Car, Search, Filter, Calendar } from "lucide-react";
import { fetchPublicProperties, PublicProperty, PublicPropertyFilters } from "@/services/publicPropertyService";
import { Link } from "react-router-dom";
import { AIPropertyBadge } from "@/components/property/AIPropertyBadge";

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
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card className="border-2 border-transparent bg-gradient-to-br from-orange-100/80 via-purple-100/60 to-pink-100/70 shadow-2xl backdrop-blur-sm overflow-hidden relative">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>

          <CardHeader className="relative bg-gradient-to-r from-orange-500/90 via-purple-500/90 to-pink-500/90 pb-4 border-b-2 border-white/30">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold drop-shadow-md">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Search className="h-5 w-5" />
              </div>
              Search Properties
            </CardTitle>
            <p className="text-white/90 text-xs mt-1">Find your perfect rental or sales property</p>
          </CardHeader>
          <CardContent className="p-5 relative bg-white/95 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {showSearch && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-orange-500">📍</span> Search
                  </label>
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 text-sm border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all rounded-xl"
                  />
                </div>
              )}

              {showFilters && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-purple-500">🏠</span> Type
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('property_type', value)}>
                      <SelectTrigger className="h-10 text-sm border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all rounded-xl">
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
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-blue-500">🛏️</span> Beds
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('bedrooms', value ? parseInt(value) : undefined)}>
                      <SelectTrigger className="h-10 text-sm border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl">
                        <SelectValue placeholder="Bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bed</SelectItem>
                        <SelectItem value="2">2 Beds</SelectItem>
                        <SelectItem value="3">3 Beds</SelectItem>
                        <SelectItem value="4">4+ Beds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-pink-500">💰</span> Type
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('listing_type', value)}>
                      <SelectTrigger className="h-10 text-sm border-2 border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all rounded-xl">
                        <SelectValue placeholder="Listing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental">For Rent</SelectItem>
                        <SelectItem value="sales">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 font-medium">
          {total > 0 ? `Showing ${properties.length} of ${total} properties` : 'No properties found'}
        </p>
      </div>

      {/* Property Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link key={property.id} to={`/property/${property.id}`} className="block">
          <Card
            key={property.id}
            className="group overflow-hidden border-2 border-slate-200/60 hover:border-orange-400 cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white transform hover:-translate-y-1"
          >
            <div className="relative overflow-hidden" aria-label={`Listing image for ${property.listing_title}`}>
              <img
                src={getPropertyImage(property)}
                alt={`${property.listing_title} photo`}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Badge className="absolute top-3 left-3 text-xs bg-white/95 text-slate-900 border-0 shadow-md">
                {property.listing_type === 'rental' ? 'For Rent' : 'For Sale'}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                {property.listing_title}
              </h3>

              {/* Property Details */}
              <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-lg p-3 space-y-2.5 text-sm border-2 border-slate-100 shadow-sm">
                {/* Price and Type in One Row */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <div className="flex items-baseline font-bold text-primary">
                      <span className="text-xl">
                        {formatPrice(
                          property.listing_type === 'rental' ? property.monthly_rent : property.sales_price,
                          property.listing_type
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{property.property_type}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="cursor-pointer hover:text-primary transition-colors">
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <div className="flex items-start gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2">
                      {property.address ? `${property.address}, ` : ''}{property.city}, {property.state}
                    </span>
                  </div>
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-1" />
                      {property.bedrooms} bed
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-1" />
                      {property.bathrooms} bath
                    </div>
                  )}
                  {property.square_footage && (
                    <div className="flex items-center">
                      <Square className="h-3 w-3 mr-1" />
                      {property.square_footage.toLocaleString()} sqft
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-semibold border-2 border-slate-300 hover:border-orange-400 hover:text-orange-600 transition-all"
                >
                  View Details
                </Button>
                <Button
                  className="h-9 text-xs font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {properties.length === 0 && !loading && (
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
      )}

      {/* Load More Button */}
      {properties.length < total && properties.length > 0 && (
        <div className="text-center">
          <Button className="w-full h-12 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 hover:from-orange-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] rounded-xl" onClick={() => {/* TODO: Load more */}}>
            Load More Properties
          </Button>
        </div>
      )}
    </div>
  );
}
