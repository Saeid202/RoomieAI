
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Bed, CalendarCheck } from "lucide-react";
import { AIPropertyBadge } from "@/components/property/AIPropertyBadge";
import { ScheduleViewingModal } from "@/components/property/ScheduleViewingModal";

interface PropertyCardProps {
  property: any;
  onViewDetails: (property: any) => void;
  ownerName?: string; // Add owner name prop
  ownerRole?: string; // Add owner role prop
}

export function PropertyCard({ property, onViewDetails, ownerName, ownerRole }: PropertyCardProps) {
  const [showScheduleViewingModal, setShowScheduleViewingModal] = useState(false);

  return (
    <>
      <Card className="overflow-hidden relative">
      <div
        className={`h-2 ${property.compatibilityScore > 80
            ? "bg-green-500"
            : property.compatibilityScore > 60
              ? "bg-yellow-500"
              : "bg-orange-500"
          }`}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">Share with {property.name}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {property.propertyDetails?.id && (
              <AIPropertyBadge propertyId={property.propertyDetails.id} variant="compact" />
            )}
            <div className="bg-muted px-2 py-1 rounded-full font-semibold text-sm">
              {property.compatibilityScore}% Match
            </div>
          </div>
        </div>
        <CardDescription>{property.propertyDetails?.address || property.location}</CardDescription>
      </CardHeader>

      <CardContent className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="font-bold text-lg text-gray-800">${Math.floor(property.budget[0] / 2)} - ${Math.floor(property.budget[1] / 2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Available</p>
            <p className="font-bold text-lg text-gray-800">{property.movingDate}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Property Type</p>
          <p className="font-semibold text-md text-gray-800">{property.propertyDetails?.propertyType || "Apartment"}</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-semibold text-md text-gray-800">{property.propertyDetails?.address || property.location}</p>
        </div>
        {/* Owner Information */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Listed by</p>
          <p className="font-semibold text-md text-gray-800">
            {ownerName || 'Property Owner'}
            {ownerRole && ` (${ownerRole})`}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-start space-x-4">
          <div className="flex items-center space-x-2">
            <Bed size={16} className="text-gray-600" />
            <span className="text-sm text-gray-700">{property.propertyDetails?.bedrooms || "1"} BR</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building size={16} className="text-gray-600" />
            <span className="text-sm text-gray-700">{property.propertyDetails?.propertyType || "Apartment"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(property)}
          >
            View Details
          </Button>
          <Button className="flex-1">Contact</Button>
        </div>
        <Button
          variant="default"
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-200"
          onClick={() => setShowScheduleViewingModal(true)}
        >
          <CalendarCheck className="h-4 w-4 mr-2" />
          Schedule Viewing
        </Button>
      </CardFooter>
    </Card>

    {/* Schedule Viewing Modal */}
    {property?.propertyDetails?.id && (
      <ScheduleViewingModal
        isOpen={showScheduleViewingModal}
        onClose={() => setShowScheduleViewingModal(false)}
        propertyId={property.propertyDetails.id}
        propertyAddress={property.propertyDetails?.address || property.location}
        landlordId={property.propertyDetails?.user_id}
      />
    )}
    </>
  );
}
