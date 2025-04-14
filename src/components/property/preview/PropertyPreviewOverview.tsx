
import { BedDouble, Bath, Home } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PropertyPreviewOverviewProps {
  price: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet?: string;
}

export function PropertyPreviewOverview({
  price,
  propertyType,
  bedrooms,
  bathrooms,
  squareFeet
}: PropertyPreviewOverviewProps) {
  return (
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          ${parseFloat(price).toLocaleString()}
          {propertyType === "rent" && <span className="text-base font-normal">/month</span>}
        </h2>
        
        <div className="flex gap-4">
          <div className="flex items-center">
            <BedDouble size={20} className="mr-2 text-muted-foreground" />
            <span>{bedrooms} {parseInt(bedrooms) === 1 ? "Bed" : "Beds"}</span>
          </div>
          
          <div className="flex items-center">
            <Bath size={20} className="mr-2 text-muted-foreground" />
            <span>{bathrooms} {parseFloat(bathrooms) === 1 ? "Bath" : "Baths"}</span>
          </div>
          
          {squareFeet && (
            <div className="flex items-center">
              <Home size={20} className="mr-2 text-muted-foreground" />
              <span>{parseInt(squareFeet).toLocaleString()} sq ft</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
    </CardContent>
  );
}
