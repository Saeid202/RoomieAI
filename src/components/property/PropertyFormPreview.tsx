
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { PropertyPreviewHeader } from "./preview/PropertyPreviewHeader";
import { PropertyPreviewOverview } from "./preview/PropertyPreviewOverview";
import { PropertyPreviewDescription } from "./preview/PropertyPreviewDescription";
import { PropertyPreviewDetails } from "./preview/PropertyPreviewDetails";

interface PropertyFormPreviewProps {
  formData: {
    title: string;
    description: string;
    address: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    propertyType: string;
    imageUrls: string[];
    squareFeet?: string;
    yearBuilt?: string;
    amenities?: string[];
    petPolicy?: string;
    utilities?: string[];
    furnishedStatus?: string;
    availability?: string;
    virtualTourUrl?: string;
    parkingType?: string;
  };
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function PropertyFormPreview({ 
  formData, 
  onBack, 
  onSubmit,
  isSubmitting 
}: PropertyFormPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          Back to Editor
        </Button>
        
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-roomie-purple hover:bg-roomie-dark"
        >
          {isSubmitting ? "Submitting..." : "Confirm & List Property"}
        </Button>
      </div>
      
      <PropertyPreviewHeader
        title={formData.title}
        address={formData.address}
        propertyType={formData.propertyType}
        furnishedStatus={formData.furnishedStatus}
        imageUrl={formData.imageUrls[0]}
        onBack={onBack}
      />
      
      <Card>
        <PropertyPreviewOverview
          price={formData.price}
          propertyType={formData.propertyType}
          bedrooms={formData.bedrooms}
          bathrooms={formData.bathrooms}
          squareFeet={formData.squareFeet}
        />
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <PropertyPreviewDescription
                description={formData.description}
                amenities={formData.amenities}
                utilities={formData.utilities}
              />
            </div>
            
            <PropertyPreviewDetails
              propertyType={formData.propertyType}
              yearBuilt={formData.yearBuilt}
              parkingType={formData.parkingType}
              petPolicy={formData.petPolicy}
              availability={formData.availability}
              virtualTourUrl={formData.virtualTourUrl}
              additionalImages={formData.imageUrls.slice(1)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
