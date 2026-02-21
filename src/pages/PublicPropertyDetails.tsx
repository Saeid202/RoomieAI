import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Car,
  PawPrint,
  Wifi,
  Zap,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { fetchPublicPropertyById, PublicProperty } from "@/services/publicPropertyService";
import { useAuth } from "@/hooks/useAuth";
import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewerSimplified";

export default function PublicPropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      const propertyData = await fetchPublicPropertyById(propertyId);
      setProperty(propertyData);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
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
    return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop";
  };

  const handleContactOwner = () => {
    if (user) {
      // User is logged in, redirect to application or contact
      if (property?.listing_type === 'rental') {
        window.location.href = `/dashboard/rental-application/${property.id}`;
      } else {
        // For sales, redirect to contact or inquiry
        window.location.href = `/dashboard/chats?property=${property.id}`;
      }
    } else {
      // User is not logged in, show signup prompt
      setShowContactForm(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or is no longer available.</p>
          <Link to="/">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Listings
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant={property.listing_type === 'rental' ? 'default' : 'secondary'}>
                {property.listing_type === 'rental' ? 'For Rent' : 'For Sale'}
              </Badge>
              <Badge variant="outline">
                {property.property_type}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <Card>
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={getPropertyImage(property)}
                  alt={property.listing_title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{property.listing_title}</CardTitle>
                <CardDescription className="text-xl font-bold text-blue-600">
                  {formatPrice(
                    property.listing_type === 'rental' ? property.monthly_rent : property.sales_price,
                    property.listing_type
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}, {property.city}, {property.state} {property.zip_code}</span>
                </div>

                {/* Property Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  )}
                  {property.square_footage && (
                    <div className="flex items-center">
                      <Square className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.square_footage.toLocaleString()} sqft</span>
                    </div>
                  )}
                  {property.available_date && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Available {new Date(property.available_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="h-2 w-2 bg-blue-600 rounded-full mr-2"></div>
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Additional Details */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.furnished !== undefined && (
                    <div className="flex items-center">
                      <Home className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.furnished ? 'Furnished' : 'Unfurnished'}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.parking}</span>
                    </div>
                  )}
                  {property.pet_policy && (
                    <div className="flex items-center">
                      <PawPrint className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{property.pet_policy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Documents */}
            {property.listing_type === 'sales' && (
              <PropertyDocumentViewer
                propertyId={property.id}
                propertyAddress={`${property.address}, ${property.city}, ${property.state}`}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Listed by {property.landlord_name || 'Property Owner'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Listed By</p>
                    <p className="text-gray-900">{property.landlord_name || 'Property Owner'}</p>
                  </div>
                  {property.property_owner && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Property Owner</p>
                      <p className="text-gray-900">{property.property_owner}</p>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">
                  {property.listing_type === 'rental'
                    ? 'Ready to apply for this rental property?'
                    : 'Interested in this property? Get in touch with the owner.'
                  }
                </p>

                <Button
                  onClick={handleContactOwner}
                  className="w-full"
                  size="lg"
                >
                  {user ? (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {property.listing_type === 'rental' ? 'Apply Now' : 'Contact Owner'}
                    </>
                  ) : (
                    'Sign Up to Apply'
                  )}
                </Button>

                {!user && (
                  <div className="text-center text-sm text-gray-600">
                    <p>Already have an account?</p>
                    <Link to="/auth" className="text-blue-600 hover:text-blue-800">
                      Log in here
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{property.property_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
                {property.neighborhood && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neighborhood</span>
                    <span className="font-medium">{property.neighborhood}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Signup Prompt Modal */}
      {showContactForm && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign Up to Apply</CardTitle>
              <CardDescription>
                Create an account to apply for this property and contact the owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                By signing up, you'll be able to:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Apply for rental properties</li>
                <li>• Contact property owners</li>
                <li>• Save your favorite properties</li>
                <li>• Track your applications</li>
              </ul>
              <div className="flex gap-2">
                <Link to="/auth" className="flex-1">
                  <Button className="w-full">Sign Up</Button>
                </Link>
                <Button variant="outline" onClick={() => setShowContactForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
