
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Bed } from "lucide-react";

interface PropertyCardProps {
  property: any;
  onViewDetails: (property: any) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div 
        className={`h-2 ${
          property.compatibilityScore > 80 
            ? "bg-green-500" 
            : property.compatibilityScore > 60 
              ? "bg-yellow-500" 
              : "bg-orange-500"
        }`} 
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Share with {property.name}</CardTitle>
          <div className="bg-muted px-2 py-1 rounded-full font-semibold text-sm">
            {property.compatibilityScore}% Match
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
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails(property)}
        >
          View Details
        </Button>
        <Button className="flex-1">Contact</Button>
      </CardFooter>
    </Card>
  );
}
