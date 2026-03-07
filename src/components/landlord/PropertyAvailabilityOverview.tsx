import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Clock, Plus, Edit, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import type { Property, LandlordAvailability } from "@/types/viewingAppointment";

interface PropertyWithAvailability extends Property {
  availabilityCount: number;
  availabilityDates: string[];
  hasAvailability: boolean;
}

interface PropertyAvailabilityOverviewProps {
  userId: string;
  onEditProperty: (propertyId: string) => void;
}

export function PropertyAvailabilityOverview({ userId, onEditProperty }: PropertyAvailabilityOverviewProps) {
  const [properties, setProperties] = useState<PropertyWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPropertiesWithAvailability();
  }, [userId]);

  const loadPropertiesWithAvailability = async () => {
    try {
      setLoading(true);
      
      // Get all properties
      const propertiesData = await viewingAppointmentService.getLandlordProperties(userId);
      
      // Get all availability for this user
      const allAvailability = await viewingAppointmentService.getUserAvailability(userId);
      
      // Get availability with specific dates (for the next 90 days)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 90);
      
      const dateAvailability = await viewingAppointmentService.getAvailabilityByDateRange(
        userId,
        null,
        today.toISOString().split('T')[0],
        futureDate.toISOString().split('T')[0]
      );
      
      // Process each property
      const propertiesWithAvailability: PropertyWithAvailability[] = propertiesData.map(property => {
        // Find availability for this specific property
        const propertySpecificAvailability = dateAvailability.filter(
          avail => avail.property_id === property.id
        );
        
        // Find global availability (property_id is null)
        const globalAvailability = dateAvailability.filter(
          avail => !avail.property_id || avail.property_id === null
        );
        
        // Combine both
        const relevantAvailability = [...propertySpecificAvailability, ...globalAvailability];
        
        // Get unique dates
        const uniqueDates = Array.from(
          new Set(
            relevantAvailability
              .filter(avail => avail.specific_date)
              .map(avail => avail.specific_date!)
          )
        ).sort();
        
        return {
          ...property,
          availabilityCount: uniqueDates.length,
          availabilityDates: uniqueDates,
          hasAvailability: uniqueDates.length > 0
        };
      });
      
      setProperties(propertiesWithAvailability);
    } catch (error) {
      console.error("Error loading properties with availability:", error);
      toast.error("Failed to load property availability");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextAvailableDates = (dates: string[], count: number = 3) => {
    return dates.slice(0, count);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading properties...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">
              You don't have any properties yet. Add a property to start managing viewing availability.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            Property Availability Overview
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Quick view of all your properties and their viewing availability
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Availability</p>
                <p className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.hasAvailability).length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Setup</p>
                <p className="text-3xl font-bold text-orange-600">
                  {properties.filter(p => !p.hasAvailability).length}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map(property => (
          <Card
            key={property.id}
            className={`transition-all hover:shadow-md ${
              property.hasAvailability
                ? 'border-l-4 border-l-green-500'
                : 'border-l-4 border-l-orange-500'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Property Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      property.hasAvailability ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        property.hasAvailability ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {property.address || `Property ${property.id.slice(0, 8)}`}
                      </h3>
                      {property.city && property.state && (
                        <p className="text-sm text-gray-600">
                          {property.city}, {property.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="space-y-3">
                    {property.hasAvailability ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {property.availabilityCount} date{property.availabilityCount !== 1 ? 's' : ''} with availability
                          </span>
                        </div>
                        
                        {/* Next Available Dates */}
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs font-semibold text-green-900 mb-2">
                            Next Available Dates:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getNextAvailableDates(property.availabilityDates).map(date => (
                              <div
                                key={date}
                                className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-green-300"
                              >
                                <Calendar className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-medium text-green-900">
                                  {formatDate(date)}
                                </span>
                              </div>
                            ))}
                            {property.availabilityCount > 3 && (
                              <span className="text-xs text-green-700 self-center">
                                +{property.availabilityCount - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">
                              No availability set
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                              Set up your viewing schedule to start receiving booking requests
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onEditProperty(property.id)}
                  className={`ml-4 ${
                    property.hasAvailability
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {property.hasAvailability ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Up
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Card */}
      <Card className="bg-gray-50 border-2 border-gray-200">
        <CardContent className="pt-6">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            Quick Tips
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Click "Set Up" or "Edit" to manage viewing availability for each property</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Green properties have availability set and can receive booking requests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Orange properties need availability setup before tenants can book viewings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You can set different availability for each property or use global settings</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
