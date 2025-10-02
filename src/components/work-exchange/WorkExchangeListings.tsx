import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Briefcase, MessageSquare, Phone, Mail, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { workExchangeService, WorkExchangeOffer, WorkExchangeFilters } from "@/services/workExchangeService";


interface WorkExchangeListingsProps {
  onCreateOffer?: () => void;
}

export default function WorkExchangeListings({ onCreateOffer }: WorkExchangeListingsProps) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<WorkExchangeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    spaceType: "",
    duration: ""
  });

  // Mock data for demonstration
  const mockOffers: WorkExchangeOffer[] = [
    {
      id: "1",
      userId: "user1",
      userName: "Sarah Johnson",
      userEmail: "sarah@example.com",
      spaceType: "private-room",
      workRequested: "House cleaning, pet care, and light cooking",
      duration: "3 months",
      workHoursPerWeek: "15 hours per week",
      address: "123 Main Street",
      city: "Toronto",
      state: "Ontario",
      zipCode: "M5V 3A8",
      amenitiesProvided: ["wifi", "meals", "parking", "laundry"],
      additionalNotes: "Looking for someone reliable and trustworthy. Must love dogs!",
      images: [],
      contactPreference: "email",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      userId: "user2",
      userName: "Mike Chen",
      userEmail: "mike@example.com",
      spaceType: "studio",
      workRequested: "IT support, tutoring, and apartment maintenance",
      duration: "6 months",
      workHoursPerWeek: "20 hours per week",
      address: "456 Queen Street",
      city: "Vancouver",
      state: "British Columbia",
      zipCode: "V6B 1A1",
      amenitiesProvided: ["wifi", "utilities", "furnished"],
      additionalNotes: "Perfect for students or freelancers. Quiet neighborhood.",
      images: [],
      contactPreference: "messenger",
      createdAt: "2024-01-14T15:30:00Z",
      updatedAt: "2024-01-14T15:30:00Z"
    }
  ];

  useEffect(() => {
    loadOffers();
  }, [filters]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since the database table might not exist
      console.log("Loading work exchange offers...");
      setOffers(mockOffers);
      
      // TODO: Uncomment when database is ready
      // const apiFilters: WorkExchangeFilters = {
      //   location: filters.location || undefined,
      //   spaceType: filters.spaceType || undefined,
      //   duration: filters.duration || undefined
      // };
      // const fetchedOffers = await workExchangeService.fetchWorkExchangeOffers(apiFilters);
      // setOffers(fetchedOffers);
    } catch (error) {
      console.error("Error loading work exchange offers:", error);
      // Fallback to mock data if API fails
      setOffers(mockOffers);
      toast.error("Failed to load work exchange offers");
    } finally {
      setLoading(false);
    }
  };

  const handleContactOffer = async (offer: WorkExchangeOffer) => {
    if (!user) {
      toast.error("Please log in to contact the offer owner");
      return;
    }

    try {
      // TODO: Implement contact functionality
      console.log("Contacting offer:", offer);
      toast.success(`Contacting ${offer.userName} about their work exchange offer`);
    } catch (error) {
      console.error("Error contacting offer:", error);
      toast.error("Failed to send message");
    }
  };

  const getSpaceTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      "private-room": "Private Room",
      "shared-room": "Shared Room",
      "studio": "Studio",
      "entire-apartment": "Entire Apartment",
      "basement": "Basement Unit",
      "other": "Other"
    };
    return typeMap[type] || type;
  };

  const getAmenityLabel = (amenity: string) => {
    const amenityMap: { [key: string]: string } = {
      "wifi": "WiFi",
      "meals": "Meals",
      "parking": "Parking",
      "laundry": "Laundry",
      "utilities": "Utilities",
      "furnished": "Furnished",
      "air-conditioning": "A/C",
      "heating": "Heating"
    };
    return amenityMap[amenity] || amenity;
  };

  const getContactIcon = (preference: string) => {
    switch (preference) {
      case "email": return <Mail className="h-4 w-4" />;
      case "phone": return <Phone className="h-4 w-4" />;
      case "messenger": return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesLocation = !filters.location || 
      offer.city.toLowerCase().includes(filters.location.toLowerCase()) ||
      offer.address.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesSpaceType = !filters.spaceType || offer.spaceType === filters.spaceType;
    
    const matchesDuration = !filters.duration || 
      offer.duration.toLowerCase().includes(filters.duration.toLowerCase());
    
    return matchesLocation && matchesSpaceType && matchesDuration;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Available Work Exchange Opportunities</h2>
          <p className="text-muted-foreground mt-1">
            Find spaces offered in exchange for work services
          </p>
        </div>
        <Button onClick={onCreateOffer} className="w-full sm:w-auto">
          <Briefcase className="h-4 w-4 mr-2" />
          Offer Your Space
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="City or address"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Space Type</label>
              <Select value={filters.spaceType} onValueChange={(value) => setFilters(prev => ({ ...prev, spaceType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All space types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All space types</SelectItem>
                  <SelectItem value="private-room">Private Room</SelectItem>
                  <SelectItem value="shared-room">Shared Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="entire-apartment">Entire Apartment</SelectItem>
                  <SelectItem value="basement">Basement Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Input
                placeholder="e.g. 3 months"
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No work exchange offers found</h3>
            <p className="text-muted-foreground mb-4">
              {offers.length === 0 
                ? "Be the first to offer your space in exchange for work!"
                : "Try adjusting your filters to see more results."
              }
            </p>
            <Button onClick={onCreateOffer}>
              <Briefcase className="h-4 w-4 mr-2" />
              Create First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{getSpaceTypeLabel(offer.spaceType)}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {offer.city}, {offer.state}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {offer.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Work Requested:</h4>
                  <p className="text-sm text-muted-foreground">{offer.workRequested}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {offer.workHoursPerWeek}
                </div>

                {offer.amenitiesProvided.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Amenities Provided:</h4>
                    <div className="flex flex-wrap gap-1">
                      {offer.amenitiesProvided.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {getAmenityLabel(amenity)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {offer.additionalNotes && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Additional Notes:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {offer.additionalNotes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {offer.userName}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {getContactIcon(offer.contactPreference)}
                    {offer.contactPreference}
                  </div>
                </div>

                <Button 
                  onClick={() => handleContactOffer(offer)}
                  className="w-full"
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Owner
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
