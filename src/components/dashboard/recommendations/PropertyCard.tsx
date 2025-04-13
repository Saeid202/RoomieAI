
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
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1">
            <Building size={12} />
            <span>{property.propertyDetails?.propertyType || "Apartment"}</span>
          </div>
          <div className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1">
            <Bed size={12} />
            <span>{property.propertyDetails?.bedrooms || "1"} BR</span>
          </div>
          <div className="bg-muted px-2 py-1 rounded-md text-xs">
            {property.workSchedule}
          </div>
        </div>
        
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span>Monthly rent:</span>
            </div>
            <span className="text-sm font-medium">${Math.floor(property.budget[0] / 2)} - ${Math.floor(property.budget[1] / 2)} /person</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span>Move-in:</span>
            </div>
            <span className="text-sm font-medium">{property.movingDate}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">About {property.name}:</h4>
          <p className="text-sm text-muted-foreground">
            {property.age}-year-old {property.gender}, works as a {property.occupation}.
            {property.smoking ? " Smoker." : " Non-smoker."} 
            {property.pets ? " Has pets." : " No pets."}
          </p>
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
